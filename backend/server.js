const express = require('express');
const path = require('path');
const cors = require('cors');
var app = express();
// Cross origin policy
app.use(cors());

const PORT = process.env.PORT || 5000;
// Socket.IO server
var server = app.listen(PORT, () => {console.log(`server running on PORT ${PORT}!`)});
const io = require('socket.io').listen(server);
exports.io = io;

// RabbitMQ server
const URL = 'amqp://admin:mypass@rabbit'
let channel;
/*
const amqp = require('amqplib/callback_api');
amqp.connect(URL, function (err, conn) {
	conn.createChannel(function (err, ch) {
		channel = ch;

		const progressExchange = 'progress';
		ch.assertExchange(progressExchange, 'fanout', {
			durable: false
		});

		ch.assertQueue('', {
			exclusive: true
		}, function(err, q) {
			if(err) {
				throw err;
			}

			console.log(" [*] Waiting for messages in %s. To exit press CTRL+C", q.queue);
			ch.bindQueue(q.queue, progressExchange, '');

			ch.consume(q.queue, function(msg) {
				if(msg.content) {
					var data = JSON.parse(msg.content)
					console.log(" [x] Received %s", data);
					io.emit('test', {data: data.message})
				}
			}, {
				noAck: true
			})
		});
	}); 
});
*/
const publishMessage = (exchange, data) => {
  channel.assertExchange(exchange, 'fanout', {
  	durable: false
  });

  channel.publish(exchange, '', Buffer.from(JSON.stringify(data)));
};

// Routes
const apiRoute = require('./routes/api');

// Specify middleware before specifying routes
// to access server scoped modules and functions
app.use((req, res, next) => {
	//req.publishMessage = publishMessage;
	next();
})

// Routers (Needs this as the first route)
app.use('/', apiRoute);

// For production uses only
if(process.env.NODE_ENV === 'production') {
	console.log("------Production Mode------")
	app.use('/static', express.static('build/static'));

	app.get('/*', (req, res)=> {  
		res.sendFile(path.join(__dirname, '/build/index.html'));
	});
};