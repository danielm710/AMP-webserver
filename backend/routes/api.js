const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const cors = require('cors');
const fileUpload = require('express-fileupload');

// Custom modules
const helper = require('../custom/fetchData')
const validate = require('../custom/validate')

// get socket.io instance from the server
var server = require('../server');
var io = server.io;

router.use(cors());

// Establish RabbitMQ connection
const amqp = require('amqplib/callback_api');
const URL = 'amqp://admin:mypass@rabbit'
let channel;
amqp.connect(URL, function (err, conn) {
	conn.createChannel(function (err, ch) {
		channel = ch;

		const progressExchange = 'progress';
		ch.assertExchange(progressExchange, 'fanout', {
			durable: false
		});

		ch.assertQueue('', {
			exclusive: true
		}, function(err, q) {
			if(err) {
				throw err;
			}

			console.log(" [*] Waiting for messages in %s. To exit press CTRL+C", q.queue);
			ch.bindQueue(q.queue, progressExchange, '');

			ch.consume(q.queue, function(msg) {
				if(msg.content) {
					var data = JSON.parse(msg.content)
					console.log(" [x] Received %s", data);

					if(data.message.message === "Done!") {
						var predictionData = data.message.predictionData;
						var uid = data.message.uid;
						sendData(predictionData, uid);
						io.emit('test', {data: data.message.message})
					} else {
						io.emit('test', {data: data.message})
					}
				}
			}, {
				noAck: true
			})
		});
	}); 
});

const publishMessage = (exchange, data) => {
  channel.assertExchange(exchange, 'fanout', {
  	durable: false
  });

  channel.publish(exchange, '', Buffer.from(JSON.stringify(data)));
};

var sendData = function(data, uid) {
	console.log("sendData called!")
	console.log(uid)
	router.get('/api/prediction/' + uid, (req, res) => {
		res.setHeader('Content-Type', 'application/json')
		res.json(data);
	});
	/*
	return new Promise((resolve, reject) => {
		router.get('/api/prediction/' + uid, (req, res) => {
			res.setHeader('Content-Type', 'application/json')
			res.json(data);
		});
		resolve("done!");
	})
	*/
}

function send_to_worker(uid, scriptPath, donePath, predictionPath) {
	var data = {
		uid: uid,
		scriptPath: scriptPath,
		donePath: donePath,
		predictionPath: predictionPath
	}
	
	taskExchange = "task";
	publishMessage(taskExchange, data)
}

// Additional server side file size check
const fileUploadOption = {
	limits: {
		fileSize: 200 * 1024  * 1024 // 200 Mb
	},
	limitHandler: ((req, res, next) => {
		const error = new Error("file too big")
		error.httpStatusCode = 400
		next(error)
		return
	})
}

function throwError(code, message, error) {
	// Create custom error object if not passed
	if(!error) {

	} else {
		
	}
}

router.post('/upload', fileUpload(fileUploadOption), (req, res) => {
	let file;
	let isUpload;
	let fileContent;
	// Access UUID from the client side
	const uid = req.body.uid;

	const AMPBaseDir = path.join('/pipeline', 'AMP-Predictor-Test');
	const loggingConfigPath = path.join(AMPBaseDir, 'template_logging.conf');
	const luigiConfigPath = path.join(AMPBaseDir, 'template_config.cfg');

	const uploadDir = path.join('/input', uid); // change
	const luigiOutDir = path.join('/output', uid);
	const donePath = path.join(luigiOutDir, 'done');
	const predictionPath = path.join(luigiOutDir, 
								'prediction', 
								'unlabeled_prediction.json');
	
	// Raw sequence is typed
	if(req.body.seq) {
		isUpload = false;
		file = req.body.seq;
		fileContent = req.body.seq;
	}

	// File is uploaded
	else {
		isUpload = true;
		file = req.files.file;
		fileContent = file.data.toString('utf8')
	}
	// Invoke all the async functions	
	(async() => {
		// Check whether submitted data conforms to valid fasta format
		try {
			// Check if the input is valid fasta
			const isValidFasta = await validate.checkFasta(fileContent);

			if(isValidFasta === true) {
				const uploadPath = await helper.moveFile(file, uploadDir, isUpload);
				const paths = await helper.getLoggingConfig(loggingConfigPath, uploadPath);
				const newConfigPath = await helper.getLuigiConfig(paths.uploadedDataPath, paths.loggingConfPath, luigiConfigPath, luigiOutDir);

				send_to_worker(uid, AMPBaseDir, donePath, predictionPath)

				//res.status(200).send(result)
				res.status(200).send("Ok!");
			}
		} catch (err) {
			const message = err.message ? err.message : "Unknown error occured";
			const code = err.code ? err.code : 500
			res.status(code).send(message);
		}
	})();	
});

module.exports = router;