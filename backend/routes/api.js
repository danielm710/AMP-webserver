const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const cors = require('cors');
const fileUpload = require('express-fileupload');
const amqp = require('amqplib/callback_api');

// Custom modules
const helper = require('../custom/fetchData')
const validate = require('../custom/validate')

router.use(cors());

var sendData = function(data, uid) {
	console.log("sendData called!")
	return new Promise((resolve, reject) => {
		router.get('/api/prediction/' + uid, (req, res) => {
			res.setHeader('Content-Type', 'application/json')
			res.json(data);
		});
		resolve("done!");
	})		
}

function send_to_worker(AMPBaseDir, configPath) {
	var data = {
		AMPBaseDir: AMPBaseDir,
		configPath: configPath
	}

  amqp.connect('amqp://localhost', function (err, conn) {
    conn.createChannel(function (err, ch) {
      var luigi = 'luigi';
      ch.assertQueue(luigi, { durable: false });
      ch.sendToQueue(luigi, Buffer.from(JSON.stringify(data)));
    });
    setTimeout(function () { conn.close(); }, 500); 
    });
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

				//send_to_worker(AMPBaseDir, newConfigPath)

				await helper.runLuigi(AMPBaseDir, newConfigPath)
				await helper.checkLuigiDone(donePath)
				const data = await helper.fetchData(predictionPath)
				const result = await sendData(data, uid)

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