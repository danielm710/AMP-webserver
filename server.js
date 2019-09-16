var express = require('express');
const apiRoute = require('./routes/api');
const cors = require('cors')
const path = require('path');

var app = express();
// Specify global middlewares
app.use(cors());

// For production uses only
if(process.env.NODE_ENV === 'production') {
	console.log("------Production Mode------")
	app.use('/static', express.static('build/static'));

	app.get('/*', (req, res)=> {  
		res.sendFile(path.join(__dirname, '/build/index.html'));
	});
};
// Routers
app.use('/', apiRoute);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {console.log(`server running on PORT ${PORT}!`)});