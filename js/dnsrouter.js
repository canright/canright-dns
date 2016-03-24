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
'/dns/lookup/:ip'                 -- reverse lookup of hosts for that ip address.<br>
'/dns/lookup/:host'               -- lookup the ip address associated with that host.<br>
'/dns/:host'                      -- resolve dns for that host with lookups for it and the default subdomains (www,mail,ftp,api,rest).<br>
'/dns/:host?subs=:sub1,:sub2,...' -- resolve dns for that host with lookups for it and the listed subdomains.<br>
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

function lookup(req, res, key) {
 if (dns.isIp(key))
    dns.reverseIp(key)
    .then (rpt => reply(res, 'dns reverseIp', out.generate(1,rpt)))
    .catch(err => reply(res, 'dns reverseIp error', err));
  else
    dns.lookupHost(key)
    .then (rpt => reply(res, 'dns lookupHost', out.generate(1,rpt)))
    .catch(err => reply(res, 'dns lookupHost error', err));
}

router.get('/dns/lookup/:key', (req, res) => {
  lookup(req, res, key);
});

router.get('/dns/:host', (req, res) => {
  dns.resolveHost(host, [])
  .then (rpt => reply(res, 'dns resolveHost', out.generate(1,rpt)))
  .catch(err => reply(res, 'dns resolveHost error', err));
});

module.exports = router;
