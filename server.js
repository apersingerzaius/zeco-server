const express = require('express'),
  app = express(),
  bodyParser = require('body-parser');
port = process.env.PORT || 31056;

app.listen(port);

console.log('API server started on: ' + port);

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

const routes = require('./routes/routes'); //importing route
routes(app); //register the route
