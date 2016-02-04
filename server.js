/*jslint node: true */
'use strict';

const xp = require('express'),
  parser = require('body-parser'),
  morgan = require('morgan'),
  dns    = require('./js/dnsrouter'),
  out    = require('./js/out'),
  PORT   = process.env.PORT || 3000,
  cli    = require('./js/cli'),
  logto  = cli.log,
  app    = xp(),
  ok     = (res, title, body) => out.reply(res, out.htmlPage(title, body)),
  help   =
`'/now' -- echo current date and time<br>
'/dns' -- DNS lookups
`;

app.use(parser.json());
app.use(parser.urlencoded({ extended: false }));
app.use(morgan('dev', {stream: logto}));
app.get('/',    (req, res) => ok(res, 'Help', help));
app.get('/now', (req, res) => ok(res, 'Now', new Date()));

app.use(dns);

console.log('Serving HTTP requests at: localhost: %d', PORT);
app.listen(PORT);
module.exports = app;
