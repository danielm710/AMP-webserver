const amqp = require('amqplib/callback_api');

// Custom modules
const helper = require('./custom/fetchData')

amqp.connect('amqp://localhost', function(err, conn) {
  if (err) {
    throw err;
  }
  conn.createChannel(function(err, ch) {
    if (err) {
      throw err;
    }
    var queue = 'luigi';

    ch.assertQueue(queue, {
      durable: false
    });

    console.log(" [*] Waiting for messages in %s. To exit press CTRL+C", queue);

		ch.consume(queue, function(msg) {
			var data = JSON.parse(msg.content)
			var AMPBaseDir = data.AMPBaseDir
			var configPath = data.configPath

		  console.log(" [x] Received %s", data);
		  helper.runLuigi(AMPBaseDir, configPath)
		}, {
		    noAck: true
		});

  });
});