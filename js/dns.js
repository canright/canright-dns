/*jslint node: true */
'use strict';

const xp   = require('express'),
  dns      = require('dns'),
  router   = xp.Router(),
  stds     = ['www', 'api', 'rest', 'mail', 'ftp'], // default subdirectries
  rrtypes  = ['NS', 'SOA', 'A', 'AAAA', 'CNAME', 'MX', 'TXT', 'SRV'], // resolution record types - 'PTR'
  truthify = b => b ? true : false,
  isIp     = s => truthify(s.match(new RegExp(/^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/))),
  isHost   = s => truthify(!isIp(s) && s.match(new RegExp(/^((?:(?:(?:\w[\.\-\+]?)*)\w)+)((?:(?:(?:\w[\.\-\+]?){0,62})\w)+)\.(\w{2,6})$/))),
  loglin   = (st, log, tit, msg) => log.push([new Date().getTime() - st, tit + ' ' + msg]),

  dns_getServers = () => dns.getServers(),

  dns_lookup = host => {
    return new Promise ((resolve, reject) => {
      if (!host.length || !host)
        reject('Host name required');
      else
        dns.lookup(host, (err, address, family) => {
          if (!err)
            resolve(address, family);
          else
            reject({err});
        });
    });
  },

  dns_reverse = ip => {
    return new Promise ((resolve, reject) => {
      if (!ip.length || !ip)
        reject('IP Address required');
      else
        dns.reverse(ip, (err, hosts) => {
          if (!err && hosts.length)
            resolve(hosts);
          else
            reject({err});
        });
    });
  },

  dns_resolve = (host, rrtype) => {
    return new Promise ((resolve) => {
      dns.resolve(host, rrtype, (err, hits) => {
        if (!err)
          resolve(hits);
        else
          resolve(null);
      });
    });
  },

  getServers = () => {
    return new Promise ((resolve) => {
      var rpt = {
          type:     'servers',
          servers:  dns_getServers(),
          evtlog:   []
        },
        tStart = new Date().getTime(),
        logger = msg => loglin(tStart, rpt.evtlog, 'getServers', msg);
      logger('start');
      logger('done');
      resolve(rpt);
    });
  },

  lookupHost = host => {
    return new Promise ((resolve, reject) => {
      if (!host.length || !host)
        reject('Host name required');
      else {
        let rpt = {
            rqsthost:  host,
            type:    'lookup',
            evtlog:  []
          },
          tStart = new Date().getTime(),
          logger = msg => loglin(tStart, rpt.evtlog, 'lookupHost ' + host, msg);
        logger('start');
        dns_lookup(host)
        .then((address, family) => {
          rpt.address = address;
          rpt.family = family;
          logger('done');
          resolve(rpt);
        })
        .catch(err => {
          logger('none: ' + err);
          resolve(rpt);
        });
      }
    });
  },

  reverseIp = ip => {
    return new Promise ((resolve, reject) => {
      if (!ip.length || !ip)
        reject('IP Address required');
      else {
        let rpt = {
            rqstip:  ip,
            type:    'ip',
            evtlog:  []
          },
          tStart = new Date().getTime(),
          logger = msg => loglin(tStart, rpt.evtlog, 'reverseIp ' + ip, msg);
        logger('start');
        dns_reverse(ip)
        .then((hosts) => {
          rpt.hosts = hosts;
          logger('done');
          resolve(rpt);
        })
        .catch(err => {
          logger('err: ' + err);
          resolve(rpt);
        });
      }
    });
  },

  resolveHost = (rqstHost, rqstSubs) => {
    return new Promise ((resolve, reject) => {
      if (!rqstHost.length || !rqstHost)
        reject('Host name required');
      else {
        let rpt = {
            rqsthost: rqstHost,
            rqstsubs: rqstSubs,
            type:     'host',
            lookups:  [],   // from hostLookup
            ips:      {},   // from hostLookup, ipReverse
            evtlog:   []
          },
          tStart = new Date().getTime(),
          logger = (ident,msg) => loglin(tStart, rpt.evtlog, ident, msg),

          loks = [], // promises <- hostResolve
          revs = [], // promises for reverse lookup

          hostLookup = dom => new Promise ((resolve) => {
            var ident = 'hostLookup ' + dom + ' ';
            logger(ident, 'start');
            dns_lookup(dom)
            .then((address, family) => {
              rpt.ips[address] = [];
              rpt.lookups.push({dom: dom, address: address, family: family});
              logger(ident, 'found ' + JSON.stringify(address));
              resolve();
            })
            .catch(err => {
              logger(ident, 'none: ' + err);
              rpt.lookups.push({dom: dom, address: 'none', err: err});
              resolve();
            });
           }),

          ipReverse = address => new Promise ((resolve) => {
            var ident = 'ipReverse ' + JSON.stringify(address) + ' ';
            logger(ident, 'start');
            dns_reverse(address)
            .then(hosts => {
              if (hosts.length) {
                logger(ident, 'found ' + hosts.length + 'associated domains');
                rpt.ips[address] = hosts;
                resolve();
              } else {
                logger(ident, 'found no associated domains.');
                rpt.ips[address] = [];
                resolve();
              }
            })
            .catch(err => {
                logger(ident, 'reverse lookup error: ' + JSON.stringify(err));
                rpt.ips[address] = [];
                resolve([]);
            });
          }),

          hostResolve = (host, rrtype) => {
            var ident = 'resolve ' + rrtype + ' for ' + host + ' ',
            prom = new Promise ((resolve) => {
              logger(ident, 'start');
              dns_resolve(host, rrtype)
              .then(hits => {
  //            logger(ident, 'done');
                resolve(hits);
              })
              .catch(err => {
                logger(ident, 'ERR: ' + err);
                resolve(null);
              });
            });
            loks.push(prom);
            prom.then (recs => {
              var knt = recs ? recs.length : 0;
              logger(ident, knt);
              rpt[rrtype] = recs;
              if (rrtype === 'A' || rrtype === 'AAAA')
                if (knt)
                  for(let k=0; k<knt; ++k) {
                    rpt.ips[recs[k]] = [];
                  }
            })
            .catch(err  => {
              logger(ident, 'ERR: ' + err);
            });
          };
        logger('hostLookups for ', rqstHost);
        loks.push(hostLookup(rqstHost));
        for (let k=0, knt=rqstSubs.length; k<knt; ++k) {
          loks.push(hostLookup([rqstSubs[k], rqstHost].join('.')));
        }

        for(let k = 0; k < rrtypes.length; ++k)
          hostResolve(rqstHost, rrtypes[k]);
        logger('looking up', loks.length);
        Promise.all(loks)
        .then( () => {
          let knt = Object.keys(rpt.ips).length;
          logger('ips', knt);
          if (knt) {
            for (let ip in rpt.ips) {
              revs.push(ipReverse(ip));
            }
            Promise.all(revs)
            .then(() => {
              logger('dns resolve', 'done');
              resolve(rpt);
            })
            .catch(err => logger('reverses failed', err));
          } else {
            logger('reverse lookups', 'no ips found');
            resolve(rpt);
          }
        });
      }
    });
  },

  resolve = (host, subs, full) => new Promise ((resolve, reject) => {
    if (typeof subs === 'undefined')
      subs = [];
    console.log('a: %s!', full);
    console.log('subs.length: %s!', subs.length);
    console.log('full: %s!', full);
    console.log('full?: %s!', full?true:false);
    console.log('undef: %s!', typeof full !== 'undefined');
    full = (subs.length || typeof full !== 'undefined' ) ? true : false;
//  full = (subs.length || (full && typeof full !== 'undefined') ) ? true : false;
    console.log('b: %s!', full);
    if (!host.length || !host)
      reject('Host name required');
    else if (isIp(host))
      reverseIp(host).then(rpt  => resolve(rpt));
    else if (isHost(host)) {
      if (full)
        resolveHost(host, subs.length ? subs : stds).then(rpt => resolve(rpt));
      else
        lookupHost(host).then(rpt => resolve(rpt));
    } else
      reject('Unrecognized host ' + host);
  });

exports.isIp        = isIp;
exports.isHost      = isHost;
exports.getServers  = getServers;
exports.lookupHost  = lookupHost;
exports.reverseIp   = reverseIp;
exports.resolveHost = resolveHost;
exports.resolve     = resolve;

const out = require('./out'),

  dnsHelp = `
'/dns?servers'      -- list of ip addresses for dns resolution servers from dns.getServers()<br>
'/dns/$host'        -- quick lookup to get the ip address associated with that host.<br>
'/dns/$ip'          -- reverse lookup of hosts for that ip address.<br>
'/dns/$host?full'   -- resolve dns for that host with lookups for it and the default subdomains (www,mail,ftp,api,rest).<br>
'/dns/$host?subs=$' -- resolve dns for that host with lookups for it and the listed subdomains.
`;
/*
'/dns?servers' (PUT)  -- replace servers list with array of ip addresses to use.
'/dns/$address/$port' -- dns.lookupService(address port, callback(err, hostname, service))
*/

router.get('/dns', (req, res) => {
  const  ok = (title, body) => out.reply(res, out.htmlPage(title, body));
  if (typeof req.query.servers === 'undefined')
    ok('DNS Help', dnsHelp);
  else
    getServers()
    .then (rpt => ok('dns getServers', out.generate(1,rpt)))
    .catch(err => ok('dns getServers error', err));
});

router.get('/dns/:host', (req, res) => {
  const  ok = (title, body) => out.reply(res, out.htmlPage(title, body)),
    subs = (typeof req.query.subs === 'undefined') ? [] : req.query.subs.split(',');
  resolve(req.params.host, subs, req.query.full)
  .then (rpt => ok('dns resolve', out.generate(1,rpt)))
  .catch(err => ok('dns resolve error', err));
});

module.exports      = router;
