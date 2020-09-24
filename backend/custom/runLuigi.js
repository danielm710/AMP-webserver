const {PythonShell} = require('python-shell');
const path = require('path');
const fs = require('fs');

var getLuigiConfig = function(uploadedDataPath, loggingConfPath, luigiConfigPath, luigiOutDir, userOptions) {
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
								.replace(/<BASE_OUT_DIR>/g, luigiOutDir)
								.replace(/<MODEL_EVALUE>/g, userOptions.modelEvalue)
								.replace(/<DOM_EVALUE>/g, userOptions.domainEvalue)
								.replace(/<LENGTH_THRESHOLD>/g, userOptions.lengthThreshold)
								.replace(/\\/g, "/");
	
			const uploadDir = path.dirname(uploadedDataPath);
			// Master config file
			const newConfigPath = '/pipeline/AMP-Predictor-Test/luigi.cfg';
			// Backup config file for debuggin purpose
			const configBackupPath = path.join(uploadDir, 'luigi.cfg');

			fs.writeFile(newConfigPath, newData, err => {
				if(err) {
					reject({
						error: err,
						message: "Something went wrong while writing a file",
						code: 500
					})
				}
				// Copy file
				fs.copyFile(newConfigPath, configBackupPath, (err) => {
					if(err) {
						reject({
							error: err,
							message: "Something went wrong while copying a file",
							code: 500
						})
					}
					resolve(newConfigPath);
				})			
			});
		});
	});		
}

// 3 separate steps
var readFasta = function(scriptPath) {
	console.log("luigi: Reading input fasta...")

	return new Promise((resolve, reject) => {
		var options = {
			mode: 'text',
			scriptPath: scriptPath,
			args: ['Read_fasta', '--local-scheduler']
		};
		PythonShell.run('AMPpredictor.py', options, (err, results) => {
			if (err) {
				reject(err);
			} else {
				resolve(true);
			}
		});
	});
}

var hmmscan = function(scriptPath) {
	console.log("luigi: Running HMMscan...")

	return new Promise((resolve, reject) => {
		var options = {
			mode: 'text',
			scriptPath: scriptPath,
			args: ['Extract_HMMscan_Metadata', '--local-scheduler']
		};
		PythonShell.run('AMPpredictor.py', options, (err, results) => {
			if (err) {
				reject(err);
			} else {
				resolve(true);
			}
		});
	});
}

var makePrediction = function(scriptPath) {
	console.log("luigi: Making prediction...")

	return new Promise((resolve, reject) => {
		var options = {
			mode: 'text',
			scriptPath: scriptPath,
			args: ['proteome_screening', '--local-scheduler']
		};
		PythonShell.run('AMPpredictor.py', options, (err, results) => {
			if (err) {
				reject(err);
			} else {
				const filteredError = filterError(results)
				if(filteredError) {
					errorObj = {
						message: filteredError
					}
					reject(errorObj)
				}
				resolve(true);
			}
		});
	});
}

var filterError = function(results) {
	const resultString = results.join('\n')
	const pattern = '<---'
	if(resultString.includes(pattern)) {
		return resultString.split(pattern)[1]
	} else {
		return ''
	}
}

module.exports = {
	getLuigiConfig,
	readFasta,
	hmmscan,
	makePrediction
}