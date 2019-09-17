const path = require('path');
const fs = require('fs');
const {PythonShell} = require('python-shell');

var prepInput = function(data, isUpload) {
	// Read uploaded file to extract content
	if(isUpload) {
		fs.readStream(data.data, (err, data) => {
			if(err) {
				throw new Error(err);
			}
			return data;				
		})
	// If user specifies raw sequences, use as it is
	} else {
		return data;
	}	
}

var moveFile = function(file, uploadDir, isUpload) {
	console.log("moveFile called!")
	// If raw sequence is submitted
	if(!isUpload) {
		return new Promise((resolve, reject) => {
			const uploadPath = path.join(uploadDir, 'custom.fa');
			fs.writeFile(uploadPath, file, err => {
				if(err) {
					reject(err);
				} else {
					resolve(uploadPath);
				}
			})
		});
	} else {
		return new Promise((resolve, reject) => {
			const uploadPath = path.join(uploadDir, file.name);
			file.mv(uploadPath, err => {
				if(err) {
					reject(err);	
				} else {
					resolve(uploadPath);
				}
			})
		})
	}		
}

var getConfig = function(uploadPath, configPath, uid) {
	console.log("getConfig called!")
	
	return new Promise((resolve, reject) => {
		fs.readFile(configPath, 'utf8', (err, data) => {
			if(err) {
				reject(err);
			}	
			var newData = data.replace(/<DATA_PATH>/g, uploadPath)
								.replace(/<UID_PATH>/g, uid);
	
			uploadDir = path.dirname(uploadPath);
			fs.writeFile(path.join(uploadDir, 'config.cfg'),
				newData, 
				err => {
					if(err) {
						reject(err);
					} else {
						resolve(true);
					}
			});
		});
	});
		
}

var runLuigi = function(scriptPath) {
	console.log("runLuigi called!")
	return new Promise((resolve, reject) => {
		var options = {
			mode: 'text',
			scriptPath: scriptPath,
			args: ['proteome_screening', '--local-scheduler']
		};
		PythonShell.run('AMPpredictor.py', options, (err, results) => {
			if (err) {
				console.log(err)
				reject(err);
			} else {
				resolve(true);
			}
			console.log(results)
		});
	});
	console.log("runLuigi called!")
};

var checkLuigiDone = function(donePath) {
	console.log("checkLuigiDone called!")
	return new Promise((resolve, reject) => {
		fs.access(donePath, fs.F_OK, err => {
			if(err) {
				reject(err);
			} else {
				resolve(true)
			}
		});
	});
}

var fetchData = function(predictionPath) {
	console.log("fetchData called!")
	return new Promise((resolve, reject) => {

		fs.readFile(predictionPath, 'utf-8', (err,content) => {
			if(err) {
				reject(err);
			} else {
				data = JSON.parse(content);
	
				resolve(data);
			}				
		});
	});
}

module.exports = {
	prepInput,
	moveFile,
	getConfig,
	runLuigi,
	checkLuigiDone,
	fetchData
}