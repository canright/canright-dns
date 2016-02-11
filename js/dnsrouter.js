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
'/dns/$host/full'                 -- resolve dns for that host with lookups for it and the default subdomains (www,mail,ftp,api,rest).<br>
'/dns/$host/$sub1/$sub2/$sub3...' -- resolve dns for that host with lookups for it and the listed subdomains.<br>

'/dns?servers'                    -- same as '/dns/servers'<br>
'/dns/$host?full'                 -- same as '/dns/$host/full'<br>
'/dns/$host?subs=$sub1,$sub2,...' -- same as '/dns/$host/$sub1/$sub2/$sub3...'<br>
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

router.get('/dns', (req, res) => {
  if (typeof req.query.servers === 'undefined')
    reply(res, 'DNS Help', dnsHelp);
  else
    dns.getServers()
    .then (rpt => reply(res, 'dns getServers', out.generate(1,rpt)))
    .catch(err => reply(res, 'dns getServers error', err));
});

router.get('/dns/:host', (req, res) => {
  const host = req.params.host;
  if (host === 'servers')
    dns.getServers()
    .then (rpt => reply(res, 'dns getServers', out.generate(1,rpt)))
    .catch(err => reply(res, 'dns getServers error', err));
  else {
    const ok = (title, body) => out.reply(res, out.htmlPage(title, body)),
      subs = (typeof req.query.subs === 'undefined') ? [] : req.query.subs.split(',');
    dns.resolve(req.params.host, subs, req.query.full)
    .then (rpt => reply(res, 'dns resolve', out.generate(1,rpt)))
    .catch(err => reply(res, 'dns resolve error', err));
  }
});

router.get('/dns/:host/:sub', (req, res) => {
  const host = req.params.host;
  const sub = req.params.sub;
  if (sub === 'full') {
    const ok = (title, body) => out.reply(res, out.htmlPage(title, body)),
      subs = []
    dns.resolve(req.params.host, [], true)
    .then (rpt => reply(res, 'dns resolve', out.generate(1,rpt)))
    .catch(err => reply(res, 'dns resolve error', err));
  } else
    reply(res, 'unexpected sub', sub);
});

module.exports = router;
