'use strict';

/** lean web server response to /dns/host/subs
 *  serves requests for /dns/host/subs
 */
const xp = require('express'),
  morgan = require('morgan'),
  parser = require('body-parser'),
  report = require('./js/report.js'),
  dns    = require('./js/dns.js'),
  cli    = require('./js/cli.js'),
  app    = xp();

app.use(parser.json());
app.use(parser.urlencoded({ extended: false }));
app.use(morgan('dev'));

console.log("- Serving HTTP requests at: localhost:" + (process.env.PORT || 3000));

app.get('/dns.html', (req, res) => {res.sendFile(req, res, '/dns.html')});

/*
app.get("/dns/:host/:subs", (req, res) => {
*/
app.get('/dns/*', (req, res) => {

  var prts = req.path.slice(5).split(',');

  if (!prts.length)
    res.status(404).send('an interesting query...<br>try /dns/host/subs');
  else {
    var host = prts[0];
    var subs = (prts.length>1)? prts.slice(1):[];

    dns.lookup(host, subs)
    .then (rpt => {res.status(200).send(report.generate(1,rpt))})
    .catch(err => {res.status(500).send(`dns.lookup error: ${err}`)});
  }
});

app.listen(process.env.PORT || 3000);

module.exports = app;
