/*jslint node: true */
'use strict';

const xp = require('express'),
  dns    = require('./dns'),
  out    = require('./out'),
  router = xp.Router(),
  help   = `
'/dns?servers'      -- list of ip addresses for dns resolution servers from dns.getServers()<br>
'/dns/$host'        -- quick lookup to get the ip address associated with that host.<br>
'/dns/$ip'          -- reverse lookup of hosts for that ip address.<br>
'/dns/$host?full'   -- resolve dns for that host with lookups for it and the default subdomains (www,mail,ftp,api,rest).<br>
'/dns/$host?subs=$' -- resolve dns for that host with lookups for it and the listed subdomains.
`;

router.get('/dns', (req, res) => {
  const  ok = (title, body) => out.reply(res, out.htmlPage(title, body));
  if (typeof req.query.servers === 'undefined')
    ok('DNS Help', help);
  else
    dns.getServers()
    .then (rpt => ok('dns getServers', out.generate(1,rpt)))
    .catch(err => ok('dns getServers error', err));
});

router.get('/dns/:host', (req, res) => {
  const ok = (title, body) => out.reply(res, out.htmlPage(title, body)),
    subs = (typeof req.query.subs === 'undefined') ? [] : req.query.subs.split(',');
  dns.resolve(req.params.host, subs, req.query.full)
  .then (rpt => ok('dns resolve', out.generate(1,rpt)))
  .catch(err => ok('dns resolve error', err));
});

module.exports = router;
