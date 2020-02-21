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

			// Make directory recursively
			mkdirOptions = {
				recursive: true
			}
			fs.mkdir(uploadDir, mkdirOptions, (err) => {
				if(err) {
					reject({
						error: err,
						message: "Something went wrong while creating a directory",
						code: 500
					})
				}
				fs.writeFile(uploadPath, file, err => {
					if(err) {
						reject({
							error: err,
							message: "Something went wrong while writing a file",
							code: 500
						})
					} else {
						resolve(uploadPath);
					}
				});
			});	
		});
	} else {
		return new Promise((resolve, reject) => {
			const uploadPath = path.join(uploadDir, file.name);

			// Make directory recursively
			mkdirOptions = {
				recursive: true
			}
			fs.mkdir(uploadDir, mkdirOptions, (err) => {
				if(err) {
					reject({
						error: err,
						message: "Something went wrong while creating a directory",
						code: 500
					})
				}
				// Move file
				file.mv(uploadPath, err => {
					if(err) {
						reject({
							error: err,
							message: "Something went wrong while moving a file",
							code: 500
						})	
					} else {
						resolve(uploadPath);
					}
				});
			});
		});
	}	
}

var getLoggingConfig = function(loggingConfigPath, uploadedDataPath) {
	console.log("getLoggingConfig called!")

	return new Promise((resolve, reject) => {
		fs.readFile(loggingConfigPath, 'utf8', (err, data) => {
			if(err) {
				reject({
					error: err,
					message: "Something went wrong while reading a file",
					code: 500
				})
			}
			const uploadDir = path.dirname(uploadedDataPath);
			// luigi related logs will be written to this file
			const logfilePath = path.join(uploadDir, 'logfile.log');
			var newData = data.replace(/<LOGGING_PATH>/g, logfilePath)
								.replace(/\\/g, "/");

			// write a new logging.conf to this path
			const newLoggingPath = path.join(uploadDir, 'logging.conf')
			fs.writeFile(newLoggingPath, newData, err => {
				if(err) {
					reject({
						error: err,
						message: "Something went wrong while writing a file",
						code: 500
					})
				} else {
					resolve({
						loggingConfPath: newLoggingPath,
						uploadedDataPath: uploadedDataPath 
					})
				}
			});
		});
	});
}

// Edit template_logging.conf and write a new logging conf file
// Edit template.cfg and write a new config file
var getLuigiConfig = function(uploadedDataPath, loggingConfPath, luigiConfigPath, uid) {
	console.log("getLuigiConfig called!")
	
	return new Promise((resolve, reject) => {
		fs.readFile(luigiConfigPath, 'utf8', (err, data) => {
			if(err) {
				reject({
					error: err,
					message: "Something went wrong while reading a file",
					code: 500
				});
			}	
			var newData = data.replace(/<LOGGING_CONF_PATH>/g, loggingConfPath)
								.replace(/<DATA_PATH>/g, uploadedDataPath)
								.replace(/<UID_PATH>/g, uid)
								.replace(/\\/g, "/");
	
			const uploadDir = path.dirname(uploadedDataPath);
			const newConfigPath = path.join(uploadDir, 'config.cfg')
			fs.writeFile(newConfigPath, newData, err => {
				if(err) {
					reject({
						error: err,
						message: "Something went wrong while writing a file",
						code: 500
					})
				} else {
					resolve(newConfigPath);
				}
			});
		});
	});
		
}

var runLuigi = function(scriptPath, newConfigPath) {
	console.log("runLuigi called!")
	// Set environment variable for luigi to access configuration file
	process.env['LUIGI_CONFIG_PATH'] = newConfigPath

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
	getLoggingConfig,
	getLuigiConfig,
	runLuigi,
	checkLuigiDone,
	fetchData
}