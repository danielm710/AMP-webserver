const amqp = require('amqplib/callback_api');

// Custom modules
const pipeline = require('./custom/runLuigi');
const helper = require('./custom/fetchData');
const messageHelper = require('./messageHelper');

amqp.connect('amqp://admin:mypass@rabbit', function(err, conn) {
	if (err) {
		throw err;
	}
	conn.createChannel(function(err, ch) {
		if (err) {
			throw err;
		}
		const ampExchange = 'ampExchange';
		const progressUpdateQueue = 'progressUpdate';
		const pipelineQueue = 'pipeline';
		const pipelineBinding = 'pipeline';

		ch.assertExchange(ampExchange, 'direct', {
			durable: false
		});

		ch.assertQueue(progressUpdateQueue, {
			exclusive: false
		});

		ch.assertQueue(pipelineQueue, {
			exclusive: false
		});

		console.log(" [*] Waiting for messages in %s. To exit press CTRL+C", pipelineQueue);
		ch.bindQueue(pipelineQueue, ampExchange, pipelineBinding);

		ch.prefetch(1);

		ch.consume(pipelineQueue, function(msg) {
			if(msg.content) {
				// Run AMPspredictor pipeline
				runPipeline(ch, progressUpdateQueue, ampExchange, msg)
			}
		}, {
			noAck: false,
		});
	});
});

var generatePipelineConfig = async function(channel, queue, exchange, runLuigiConfigOptions) {
	// TODO: Error if one of the options does not exist?

	try {
		await pipeline.getLuigiConfig(
			runLuigiConfigOptions.uploadedDataPath,
			runLuigiConfigOptions.loggingConfPath,
			runLuigiConfigOptions.luigiConfigPath,
			runLuigiConfigOptions.luigiOutDir,
			runLuigiConfigOptions.userOptions
		)
	} catch(err) {
		throw err
	}
}

var processPipelineInput = async function(uid, channel, queue, exchange, scriptPath) {
	let dataToSend = {
		message: 'Reading input fasta file...',
		uid: uid,
	}
	messageHelper.publishMessage(channel, queue, exchange, dataToSend)

	try {
		await pipeline.readFasta(scriptPath)
	} catch(err) {
		throw err
	}
}

var runPipelineHmmscan = async function(uid, channel, queue, exchange, scriptPath) {
	let dataToSend = {
		message: 'Running HMMscan...',
		uid: uid,
	}
	messageHelper.publishMessage(channel, queue, exchange, dataToSend)

	try {
		await pipeline.hmmscan(scriptPath)
	} catch(err) {
		throw err
	}
}

var runPipelinePrediction = async function(uid, channel, queue, exchange, scriptPath) {
	let dataToSend = {
		message: 'Making prediction...',
		uid: uid,
	}
	messageHelper.publishMessage(channel, queue, exchange, dataToSend)

	try {
		await pipeline.makePrediction(scriptPath)
	} catch(err) {
		throw err
	}
}

var checkPipelineDone = async function(uid, channel, queue, exchange, donePath, predictionPath) {
	let isPipelineDone = false;
	try {
		isPipelineDone = await helper.checkLuigiDone(donePath)
	} catch(err) {
		throw err
	}

	if(isPipelineDone === true) {
		const predictionData = await helper.fetchData(predictionPath)
		const doneData = {
			message: 'Done!',
			predictionData: predictionData,
			uid: uid,
		}
		messageHelper.publishMessage(channel, queue, exchange, doneData)
	} else {
		dataToSend = {
			message: 'Job failed...',
			uid: uid,
		}
		messageHelper.publishMessage(channel, queue, exchange, dataToSend)
	}
}

var runPipeline = async function(channel, progressUpdateQueue, exchange, rabbitMsg) {
	const data = JSON.parse(rabbitMsg.content);
	const uploadedDataPath = data.uploadedDataPath;
	const loggingConfPath = data.loggingConfPath;
	const luigiConfigPath = data.luigiConfigPath;
	const luigiOutDir = data.luigiOutDir;
	const userOptions = data.userOptions;
	const uid = data.uid;
	const scriptPath = data.scriptPath;
	const donePath = data.donePath;
	const predictionPath = data.predictionPath;
	const dataToSend = '';

	const runLuigiConfigOptions = {
		uploadedDataPath: uploadedDataPath,
		loggingConfPath: loggingConfPath,
		luigiConfigPath: luigiConfigPath,
		luigiOutDir: luigiOutDir,
		userOptions: userOptions,
	};

	try {
		await generatePipelineConfig(channel, progressUpdateQueue, exchange, runLuigiConfigOptions)
		await processPipelineInput(uid, channel, progressUpdateQueue, exchange, scriptPath)
		await runPipelineHmmscan(uid, channel, progressUpdateQueue, exchange, scriptPath)
		await runPipelinePrediction(uid, channel, progressUpdateQueue, exchange, scriptPath)
		await checkPipelineDone(uid, channel, progressUpdateQueue, exchange, donePath, predictionPath)
	} catch(err) {
		let dataToSend;
		if(err.message) {
			dataToSend = {
				message: 'Error: '+err.message.toString(),
				uid: uid,
			}
		} else {
			dataToSend = {
				message: 'Internal server error...',
				uid: uid,
			}
			console.log(err)
		}
		messageHelper.publishMessage(channel, progressUpdateQueue, exchange, dataToSend)
	}
	channel.ack(rabbitMsg)
}