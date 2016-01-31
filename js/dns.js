'use strict';

/* configuration for dns lookup
*  stds = array of default (standard) subdirectories
*  rrtypes = array of dns resolution record types to resolve
*/

/** deep lookup for host and subdomains
*
*   @param {string} rqsthost - domain with dns, eg: canright.com
*   @param (array of strings) rqstsubs - eg: ["www", "ftp", "mail"]
*   @returns {promise}
*   @resolve {rpt} - data object
*/

const dns = require('dns'),
  stds    = ['www', 'api', 'rest', 'mail', 'ftp'],
  rrtypes = ['NS', 'SOA', 'A', 'AAAA', 'CNAME', 'MX', 'TXT', 'SRV']; // 'PTR'

var truthify = b => b ? true : false;
var isIp   = s => truthify(s.match(new RegExp(/^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/)));
var isHost = s => truthify(!isIp(s) && s.match(new RegExp(/^((?:(?:(?:\w[\.\-\+]?)*)\w)+)((?:(?:(?:\w[\.\-\+]?){0,62})\w)+)\.(\w{2,6})$/)));

var lookupHost = host => {
  return new Promise ((resolve, reject) => {
    if (!host.length || !host)
      reject('Host name required');
    else {
      var rpt = {
          rqsthost:  host,
          type:    'lookup',
          evtlog:  []
        },
        tStart = new Date().getTime(),
        logger= msg => {rpt.evtlog.push([new Date().getTime() - tStart, 'lookuo ' + host + ' ' + msg])};
      logger('start');
      dns.lookup(host, (err, address, family) => {
        if (!err) {
          logger('found ' + address);
          rpt.address = address;
          rpt.family = family;
          resolve(rpt);
        } else {
          logger('error ' + err);
          resolve(rpt);    
        }          
      });
    }
  });
}

var reverseIp = ip => {
  return new Promise ((resolve, reject) => {
    if (!ip.length || !ip)
      reject('IP Address required');
    else {
      var rpt = {
          rqstip:  ip,
          type:    'ip',
          evtlog:  []
        },
        tStart = new Date().getTime(),
        logger= msg => {rpt.evtlog.push([new Date().getTime() - tStart, 'reverse lookup ' + ip + ' ' + msg])};
      logger('start');
      dns.reverse(ip, (err, hosts) => {
        if (!err && hosts.length && hosts.length) {
          logger('found ' + hosts.length + ' associated domains');
          rpt.hosts = hosts;
        } else {
          rpt.hosts = [];
          logger('found no associated domains: ' + (err?err:'but no errors'));
        }
        resolve(rpt);
      });
    }
  });
}

var resolveHost = (rqstHost, rqstSubs) => {
  return new Promise ((resolve, reject) => {
    if (!rqstHost.length || !rqstHost)
      reject('Host name required');
    else {
      var rpt = {
          rqsthost: rqstHost,
          rqstsubs: rqstSubs,
          type:     'host',
          subdoms:  [],
          servers:  dns.getServers(),
          lookups:  [],
          ips:      {},
          evtlog:   []
        },
        tStart = new Date().getTime(),
        logger= msg => {rpt.evtlog.push([new Date().getTime() - tStart, msg])},

        loks = [], // array of promises for lookups
        revs = [], // array of promises for reverse lookup

        lookitup = dom => new Promise ((resolve, reject) => {
          var ident = 'lookitup ' + dom + ' ';
          logger(ident + 'start');
          dns.lookup(dom, (err, address, family) => {
            if (!err) {
              logger(ident + 'found ' + address);
              rpt.ips[address] = [];
              rpt.lookups.push({dom: dom, address: address, family: family});
              resolve(address);
            } else {
              logger(ident + 'none');
              rpt.lookups.push({dom: dom, address: 'none', err: err});
              resolve('');              
            }
          });
        }),

        reverseLookup = address => new Promise ((resolve, reject) => {
          var ident = 'reverse ' + address + ' ';
          logger(ident + 'start');
          dns.reverse(address, (err, revhosts) => {
            if (!err) {
              if (revhosts.length) {
                logger(ident  + 'found ' + revhosts.length + 'associated domains');
                rpt.ips[address] = revhosts;
                resolve(revhosts);              
              } else {
                logger(ident  + 'found no associated domains.');
                rpt.ips[address] = [];
                resolve([]);
              }
            } else {
              logger(ident  + 'reverse lookup error: ' + err);
              rpt.ips[address] = [];
              resolve([]);
            }
          });
        }),

        resolver = (hostname, rrtype) => {
          var ident = 'resolve ' + rrtype + ' ',
          prom = new Promise ((resolve, reject) => {
            logger(ident + 'start');
            dns.resolve(hostname, rrtype, (err, hits) => {
              if (!err) {
                logger(ident + 'done');
                resolve(hits)
              } else {
                logger(ident + 'ERR: ' + err);
                resolve(null)
              }
            });
          });
          loks.push(prom);
          prom.then (recs => {
            logger(ident + recs.length);
            rpt[rrtype] = recs;
            if (rrtype === 'A' || rrtype === 'AAAA')
              if (recs.length)
                for(let k=0, knt=recs.length; k<knt; ++k) {
                  rpt.ips[recs[k]] = [];
                }
          })
          .catch(err  => {
            logger(ident + 'ERR: ' + err);
          });
        };
      logger("lookitup " + rqstHost);
      loks.push(lookitup(rqstHost));
      for (let k=0, knt=rqstSubs.length; k<knt; ++k) {
        loks.push(lookitup([rqstSubs[k], rqstHost].join('.')));
      }

      for(let k = 0; k < rrtypes.length; ++k)
        resolver(rqstHost, rrtypes[k]);
      logger('looking up ' + loks.length);
      Promise.all(loks)
      .then( () => {
        let knt = Object.keys(rpt.ips).length;
        logger('ips: ' + knt);
        if (knt) {
          for (let ip in rpt.ips) {
            revs.push(reverseLookup(ip));
          }
          Promise.all(revs)
          .then(() => {resolve(rpt)})
          .catch(err => logger('reverses failed: ' + err));
        } else {
          logger('no ips found');
          resolve(rpt);
        }

      });
    }
  });
};

var lookup = host => new Promise ((resolve, reject) => {
  if (!host.length || !host)
    reject('Host domain name or IP address required');
  else if (isIp(host))
    reverseIp(host).then(rpt  => resolve(rpt));
  else if (isHost(host))
    lookupHost(host).then(rpt => resolve(rpt));
  else
    reject('Unrecognized host ' + host);
});

var resolve = (host, subs, full) => new Promise ((resolve, reject) => {
  if (typeof subs === 'undefined')
    subs = [];
  full = (subs.length || (typeof full !== 'undefined'));
  if (!host.length || !host)
    reject('Host name required');
  else if (isIp(host))
    reverseIp(host).then(rpt  => resolve(rpt));
  else if (isHost(host)) {
    if (full)
      resolveHost(host, subs.length ? subs : stds).then(rpt => resolve(rpt))
    else
      lookupHost(host).then(rpt => resolve(rpt));
  } else
    reject('Unrecognized host ' + host);
});

exports.isIp        = isIp;
exports.isHost      = isHost;
exports.reverseIp   = reverseIp;
exports.resolveHost = resolveHost;
exports.lookup      = lookup;
exports.resolve     = resolve;
