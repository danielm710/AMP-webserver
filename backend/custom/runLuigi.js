const {PythonShell} = require('python-shell');

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
				console.log(err)
				reject(err);
			} else {
				resolve(true);
			}
			console.log(results)
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
				console.log(err)
				reject(err);
			} else {
				resolve(true);
			}
			console.log(results)
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
				console.log(err)
				reject(err);
			} else {
				resolve(true);
			}
			console.log(results)
		});
	});
}

module.exports = {
	readFasta,
	hmmscan,
	makePrediction
}