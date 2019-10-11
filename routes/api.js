const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const cors = require('cors');
const fileUpload = require('express-fileupload');

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

router.post('/upload', fileUpload(fileUploadOption), (req, res) => {
	let file;
	let isUpload;
	let fileContent;
	// Access UUID from the client side
	const uid = req.body.uid;

	const AMPBaseDir = path.join(__dirname, '../AMP-Predictor-Test');
	const uploadDir = path.join(AMPBaseDir, 'data', uid);
	const loggingConfigPath = path.join(AMPBaseDir, 'template_logging.conf');
	const luigiConfigPath = path.join(AMPBaseDir, 'template_config.cfg');
	const luigiOutDir = path.join(AMPBaseDir, 'outputs', uid);
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
		let isValidFasta

		// Check whether submitted data conforms to valid fasta format
		try {
			isValidFasta = validate.checkFasta(fileContent);
		} catch (err) {
			console.log(err.message)
			res.status(400).send(err.message);
		}
		if(isValidFasta) {
			helper.moveFile(file, uploadDir, isUpload)
				.then(uploadPath => helper.getLoggingConfig(loggingConfigPath,uploadPath))
				.then(paths => helper.getLuigiConfig(paths.uploadedDataPath, paths.loggingConfPath, luigiConfigPath, uid))
				.then(newConfigPath => helper.runLuigi(AMPBaseDir, newConfigPath))
				.then(_ => helper.checkLuigiDone(donePath))
				.then(_ => helper.fetchData(predictionPath))
				.then(data => sendData(data, uid))
				.then(result => res.status(200).send(result))
				.catch(err => res.status(500).send(err))
		}

		//if(isValidFasta) {
		//	helper.moveFile(file, uploadDir, isUpload)
		//		.then(uploadPath => helper.getConfig(uploadPath, configPath, uid))
		//		.then(_ => helper.runLuigi(AMPBaseDir))
		//		.then(_ => helper.checkLuigiDone(donePath))
		//		.then(_ => helper.fetchData(predictionPath))
		//		.then(data => res.send(data))
		//		.catch(err => res.status(500).send(err))
		//}	
	})();
});

module.exports = router;