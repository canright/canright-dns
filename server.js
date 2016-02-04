/*jslint node: true */
'use strict';

const xp = require('express'),
  parser = require('body-parser'),
  morgan = require('morgan'),
  dns    = require('./js/dns'),
  cli    = require('./js/cli'),
  app    = xp(),
  ok     = (res,s) => {res.status(200).send(s);},

  webHelp = `
'/now' -- echo current date and time<br>
'/dns' -- DNS lookups
`;

app.use(parser.json());
app.use(parser.urlencoded({ extended: false }));
app.use(morgan('dev', {stream: cli.out}));

app.get('/',    (req, res) => ok(res, webHelp));
app.get('/now', (req, res) => ok(res, 'It is now: ' + new Date()));

app.use(dns);

app.get('/*', (req, res) => { // static files if found
  res.sendFile(req.path), (err) => {
    if (!err || err.code !== 'ECONNABORT' || res.statusCode !== 304)
      return false;
    else {
      res.status(404).send('File not found');
      return true;
    }
  };
});

cli.say('Serving HTTP requests at: localhost:' + (process.env.PORT || 3000));
app.listen(process.env.PORT || 3000);
module.exports = app;
