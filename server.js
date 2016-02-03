/*jslint node: true */
'use strict';

const express = require('express'),
  parser = require('body-parser'),
  morgan = require('morgan'),
  dns = require('./js/dns'),
  out = require('./js/out'),
  cli = require('./js/cli'),
  app = express(),
  ok  = (res,s) => {res.status(200).send(s)},

  webHelp = `
'/now' -- echo current date and time<br>
'/dns' -- DNS lookups
`,

  dnsHelp = `
'/dns?servers'        -- list of ip addresses for dns resolution servers from dns.getServers()<br>
'/dns/$host'          -- quick lookup to get the ip address associated with that host.<br>
'/dns/$ip'            -- reverse lookup of hosts for that ip address.<br>
'/dns/$host?full'     -- resolve dns for that host with lookups for it and the default subdomains (www,mail,ftp,api,rest).<br>
'/dns/$host?subs=$'   -- resolve dns for that host with lookups for it and the listed subdomains.
`;

/*
'/dns?servers' PUT    -- replace servers list with array of ip addresses to use.
'/dns/$address/$port' -- dns.lookupService(address port, callback(err, hostname, service))
*/

app.use(parser.json());
app.use(parser.urlencoded({ extended: false }));

app.use(morgan('dev', {stream: cli.out}));

app.get('/',    (req, res) => ok(res, webHelp));
app.get('/now', (req, res) => ok(res, 'It is now: ' + new Date()));

// app.use(dns); 

app.get('/dns', (req, res) => {
  if (typeof req.query.servers !== 'undefined')
    dns.servers()
       .then (rpt => ok(res, out.generate(1,rpt)))
       .catch(err => ok(res, `dns.servers error: ${err}`));
  else
    ok(res, dnsHelp);
});

app.get('/dns/:host', (req, res) => {
  var subs = (typeof req.query.subs === 'undefined') ? [] : req.query.subs.split(',');
  dns.resolve(req.params.host, subs, req.query.full)
    .then (rpt => ok(res, out.generate(1,rpt)))
    .catch(err => ok(res, `dns.resolve error: ${err}`));
});

app.get('/*', (req, res) => { // static files if found
  res.sendFile(req.path), (err) => {
    if (!err || err.code !== "ECONNABORT" || res.statusCode !== 304)
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
