/*jslint node: true */
'use strict';

const app = (require('express'))(),
  parser  = require('body-parser'),
  morgan  = require('morgan'),
  dnsrout = require('./js/dnsrouter'),
  PORT    = process.env.PORT || 3000,
  logto   = process.stdout;

app.use(parser.json());
app.use(parser.urlencoded({extended: false}));
app.use(morgan('dev', {stream: logto}));

app.use(dnsrout);

console.log('Serving HTTP requests at: localhost: %d', PORT);
app.listen(PORT);
module.exports = app;
