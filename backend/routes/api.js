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

// Socket.io join room
io.on('connection', socket => {
  socket.on('join', (data) => {
  	console.log("Socket joining room: ", data.room)
  	socket.join(data.room)
  	socket.to(data.room).emit('joined room')
  });

  socket.on('leave', (data) => {
  	console.log("Socket leaving room: ", data.room)
  	socket.leave(data.room)
  })
});

// Establish RabbitMQ connection
const amqp = require('amqplib/callback_api');
const URL = 'amqp://admin:mypass@rabbit'
let channel;
const ampExchange = 'ampExchange';
const progressUpdateQueue = 'progressUpdate';
const pipelineQueue = 'pipeline';
const progressBinding = 'progressUpdate';

amqp.connect(URL, function (err, conn) {
	conn.createChannel(function (err, ch) {
		channel = ch;

		ch.assertExchange(ampExchange, 'direct', {
			durable: false
		});

		ch.assertQueue(progressUpdateQueue, {
			exclusive: false
		});

		ch.assertQueue(pipelineQueue, {
			exclusive: false
		});

		console.log(" [*] Waiting for messages in %s. To exit press CTRL+C", progressUpdateQueue);
		ch.bindQueue(progressUpdateQueue, ampExchange, progressBinding);
		ch.prefetch(1);
		ch.consume(progressUpdateQueue, function(msg) {
			if(msg.content) {
				var data = JSON.parse(msg.content)
				console.log(" [x] Received %s", data);

				if(data.result.message === "Done!") {
					var predictionData = data.result.predictionData;
					var uid = data.result.uid;
					sendData(predictionData, uid);
					io.sockets.in(uid).emit('test', {data: data.result.message})
				} else {
					var uid = data.result.uid;
					io.sockets.in(uid).emit('test', {data: data.result.message})
				}
			}
		}, {
			noAck: true
		});
	}); 
});

const publishMessage = (queue, exchange, data) => {
  channel.assertExchange(exchange, 'direct', {
  	durable: false
  });

  channel.publish(exchange, queue, Buffer.from(JSON.stringify(data)));
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

function send_to_worker(
	uploadedDataPath,
	loggingConfPath,
	luigiConfigPath,
	luigiOutDir,
	userOptions,
	uid,
	scriptPath,
	donePath,
	predictionPath) {

	var data = {
		uploadedDataPath: uploadedDataPath,
		loggingConfPath: loggingConfPath,
		luigiConfigPath: luigiConfigPath,
		luigiOutDir: luigiOutDir,
		userOptions: userOptions,
		uid: uid,
		scriptPath: scriptPath,
		donePath: donePath,
		predictionPath: predictionPath
	}
	
	publishMessage(pipelineQueue, ampExchange, data)
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

	// User specified options
	const modelEvalue = req.body['Model E-value'];
	const domainEvalue = req.body['Domain E-value'];
	const lengthThreshold = req.body['Length threshold'];
	const userOptions = {
		modelEvalue: modelEvalue,
		domainEvalue: domainEvalue,
		lengthThreshold: lengthThreshold,
	}

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
				//const newConfigPath = await helper.getLuigiConfig(paths.uploadedDataPath, paths.loggingConfPath, luigiConfigPath, luigiOutDir, userOptions);

				send_to_worker(
					paths.uploadedDataPath,
					paths.loggingConfPath,
					luigiConfigPath,
					luigiOutDir,
					userOptions,
					uid,
					AMPBaseDir,
					donePath,
					predictionPath
				)

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