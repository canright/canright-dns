/*jslint node: true */
'use strict';

const dns = require('./dns'),
  out     = require('./out'),
  router  = require('express').Router(),

  help   =
`'/now' -- echo current date and time<br>
'/dns' -- DNS lookups
`,

  dnsHelp = `
'/dns'                            -- this dns help page<br>
'/dns/servers'                    -- list of ip addresses for dns resolution servers from dns.getServers()<br>
'/dns/$ip'                        -- reverse lookup of hosts for that ip address.<br>
'/dns/$host'                      -- quick lookup to get the ip address associated with that host.<br>
'/dns/$host?subs=$sub1,$sub2,...' -- same as '/dns/$host/$sub1/$sub2/$sub3...'<br>
'/dns/$host/full'                 -- resolve dns for that host with lookups for it and the default subdomains (www,mail,ftp,api,rest).<br>
<br>
'/dns/$host/$sub1/$sub2/$sub3...' -- resolve dns for that host with lookups for it and the listed subdomains.<br>
`,

  htmlPage = (title, body) =>
`<!DOCTYPE HTML>
<html>
<head>
<title>${title}</title>
<meta charset="utf-8" />
</head>
<body>
${body}
</body>
</html>
`,

  reply = (res, title, body) => res.status(200).send(htmlPage(title, body));

router.get('/',    (req, res) => reply(res, 'Help', help));
router.get('/now', (req, res) => reply(res, 'Now', new Date()));
router.get('/dns', (req, res) => reply(res, 'DNS Help', dnsHelp));

router.get('/dns/servers', (req, res) => {
  dns.getServers()
  .then (rpt => reply(res, 'dns getServers', out.generate(1,rpt)))
  .catch(err => reply(res, 'dns getServers error', err));
});

const resolver = (res, host, subs, full) => {
  dns.resolve(host, subs, full)
  .then (rpt => reply(res, 'dns resolve', out.generate(1,rpt)))
  .catch(err => reply(res, 'dns resolve error', err));
}

router.get('/dns/:host', (req, res) => {
  if (typeof req.query.subs === 'undefined')
    resolver(res, req.params.host, [], false);
  else // ?subs=www,ftp,mail
    resolver(res, req.params.host, req.query.subs.split(','), true);
});

router.get('/dns/:host/full', (req, res) => {
  resolver(res, req.params.host, [], true);
});

router.get('/dns/:host/:sub', (req, res) => {
  const subs = [req.params.sub];
  resolver(res, req.params.host, subs, true)
});

module.exports = router;
