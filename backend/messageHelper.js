var publishMessage = function(channel, queue, exchange, data) {
	channel.publish(exchange, queue, Buffer.from(
		JSON.stringify(
			{result: data}
		)
	));
}

module.exports = {
	publishMessage,
}