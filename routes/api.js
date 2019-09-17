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

var sendData = function(data) {
	console.log("sendData called!")
	return new Promise((resolve, reject) => {
		router.get('/api/data', (req, res) => {
			res.setHeader('Content-Type', 'application/json')
			res.json(data);
		});
		resolve("done!");
	})		
}


router.post('/upload', fileUpload(), (req, res) => {
	let file;
	let isUpload;
	let fileContent;
	// Access UUID from client side
	//const uid = req.body.uid;
	const uid = "c3ed-acb1";

	const AMPBaseDir = path.join(__dirname, '../AMP-Predictor-Test');
	const uploadDir = path.join(AMPBaseDir, 'data');
	const configPath = path.join(AMPBaseDir, 'template_config.cfg');
	const luigiOutDir = path.join(AMPBaseDir, 'outputs', uid);
	const donePath = path.join(luigiOutDir, 'done');
	const predictionPath = path.join(luigiOutDir, 
								'prediction', 
								'unlabeled_pos_prediction.json');
	
	// Raw sequence is typed
	if(req.body.seq) {
		isUpload = false;
		file = req.body.seq;
		fileContent = req.body.seq;
		console.log('raw')
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
		
		//if(isValidFasta) {
		//	helper.moveFile(file, uploadDir, isUpload)
		//		.then(uploadPath => helper.getConfig(uploadPath))
		//		.then(_ => helper.runLuigi())
		//		.then(_ => helper.checkLuigiDone())
		//		.then(_ => helper.fetchData())
		//		.then(data => sendData(data))
		//		.then(result => res.send(result))
		//		.catch(err => res.status(500).send(err))
		//}

		if(isValidFasta) {
			helper.moveFile(file, uploadDir, isUpload)
				.then(uploadPath => helper.getConfig(uploadPath, configPath, uid))
				.then(_ => helper.runLuigi(AMPBaseDir))
				.then(_ => helper.checkLuigiDone(donePath))
				.then(_ => helper.fetchData(predictionPath))
				.then(data => res.send(data))
				.catch(err => res.status(500).send(err))
		}	
	})();
});

module.exports = router;