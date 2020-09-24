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