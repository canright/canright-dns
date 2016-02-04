/*jslint node: true */
'use strict';

const xp = require('express'),
  parser = require('body-parser'),
  morgan = require('morgan'),
  dns    = require('./js/dns'),
  out    = require('./js/out'),
  PORT   = process.env.PORT || 3000,
  app    = xp(),

  webHelp =
`'/now' -- echo current date and time<br>
'/dns' -- DNS lookups
`,

  ok  = (res, title, body) => out.reply(res, out.htmlPage(title, body));

app.use(parser.json());
app.use(parser.urlencoded({ extended: false }));
app.use(morgan('dev'));

app.get('/',    (req, res) => ok(res, 'Help', webHelp));
app.get('/now', (req, res) => ok(res, 'Now', new Date()));

app.use(dns);

console.log('Serving HTTP requests at: localhost: %d', PORT);
app.listen(PORT);
module.exports = app;
