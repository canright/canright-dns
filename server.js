'use strict';

/**
 *  lean web server response to /dns/host or dns/host:?subs=www,ftp,mail
 */
const xp = require('express'),
  parser = require('body-parser'),
  morgan = require('morgan'),
  dns = require('./js/dns.js'),
  out = require('./js/out.js'),
  cli = require('./js/cli.js'),
  app = xp(),
  dnsHelp = `
'/dns/host'      -- quick lookup to get the ip address associated with that host.<br>
'/dns/ip'        -- reverse lookup of hosts for that ip address.<br>
'/dns/host?full' -- resolve dns for that host with lookups for it and the default subdomains (www,mail,ftp,api,rest).<br>
'/dns/host?subs' -- resolve dns for that host with lookups for it and the listed subdomains.`;

app.use(parser.json());
app.use(parser.urlencoded({ extended: false }));
app.use(morgan('dev'));

app.get('/', (req,res) => {
  res.status(200).send(`
'/now'           -- echo current date and time<br>
'/dns'           -- DNS lookups`
  );
});

app.get('/dns', (req,res) => {res.status(200).send(dnsHelp)});

app.get('/dns/:host', (req, res) => {
  var subs = (typeof req.query.subs === 'undefined') ? [] : req.query.subs.split(',');
  dns.resolve(req.params.host, subs, req.query.full)
     .then (rpt => {res.status(200).send(out.generate(1,rpt))})
     .catch(err => {res.status(500).send(`dns.resolve error: ${err}`)});
 });

app.get('/now', (req, res) => {
  res.status(200).send('It is now: ' + new Date());
});

cli.say("Serving HTTP requests at: localhost:" + (process.env.PORT || 3000));
app.listen(process.env.PORT || 3000);
module.exports = app;
