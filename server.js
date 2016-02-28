/*jslint node: true */
'use strict';

const app = (require('express'))(),
  parser  = require('body-parser'),
<<<<<<< HEAD
  morgan  = require('morgan'),
=======
  log     = require('morgan'),
>>>>>>> 95d9fe33aafcdf26f6a101128cb5b8c23e597668
  dnsrout = require('./js/dnsrouter'),
  PORT    = process.env.PORT || 3000,
  cli     = require('./js/cli'),
  logto   = cli.log;

app.use(parser.json());
app.use(parser.urlencoded({extended: false}));
app.use(morgan('dev', {stream: logto}));

app.use(dnsrout);

console.log('Serving HTTP requests at: localhost: %d', PORT);
app.listen(PORT);
module.exports = app;
