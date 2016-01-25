'use strict';

/* wraps and consolides the node dns module with a promise for a consolidated lookup similar to this:

  exports.lookup = (host, subs) => {
    dns.getServers();
    dns.resolve(host, eachof(["NS", "SOA", "A", "AAAA", "CNAME", MX", "TXT", "SRV", "PTR"])
    dns.lookup(base host and each of host's subdomains in subs)
  }
  .then(report);  // records collected from all above

  where the host is the host domain name that has a nameserver
  and subs is a list of subdomain prefexis to check for A records in addition to the base domain.
  if subs is empty, the default lookup list, ["", www.", "api.", "rest.", "mail.", "ftp."]) is used.
  promise resolution records each has the distinctive properties of the associated rrtype.
  Reverse lookups (associated hostnames) are performed for each IP address lookup resuld  referenced in A, AAAA, CNAME, or MX records.

  domain report: {
    type: "domain",
    rqsthost: the hostname to resolve, like 'canright.com',
    subdomains: [subdomains to lookup],
    servers: [DNS servers from dns.getServers()],
    lookups: [results of lookups for the host and subdomains],
    NS:   [NS records resolved],
    SOA:  {SAO record resolved},
    A:    [A records resolved],
    AAAA: [AAAA records resolved],
    CNAME:[CNAME records resolved],
    MX:   [MX records resolved],
    TXT:  [TXT records resolved],
    SRV:  [SRV records resolved],
    PTR:  [PTR records resolved],
    REVERSE: {ip addresses referenced each with an array of lookups{ip: [reverses]} }
  }

  domain report: {
    type: "ip",
    rqsthost: the IP address to lookup, like '198.145.41.172',
    servers: [DNS servers from dns.getServers()],
    reverses: [associated domain from reverse lookup]
  }

  exports.lookupService(address, port) then(hostname)
*/

/* configuration for dns lookup
*  stds = array of default (standard) subdirectories
*  rrtypes = array of dns resolution record types to resolve
*/
const dns = require('dns'),
  stds    = ['www', 'api', 'rest', 'mail', 'ftp'],
  rrtypes = ['NS', 'SOA', 'A', 'AAAA', 'CNAME', 'MX', 'TXT', 'SRV']; // 'PTR'

/** deep lookup for host and subdomains
*
*   @param {string} rqsthost - domain with dns, eg: canright.com
*   @param (array of strings) rqstsubs - eg: ["www", "ftp", "mail"]
*   @returns {promise}
*   @resolve {rpt} - data object
*/
exports.lookup = (rqsthost, rqstsubs) => {
  var tStart = new Date();
  var subs = rqstsubs.length ? rqstsubs : stds;

  return new Promise ((resolve, reject) => {
    if (!rqsthost) {
      var mag = "Domain name required";
      logit(msg);
      reject(msg);
    } else {
      var rpt = {
          rqsthost:   rqsthost,
          subdomains: subs,
          servers:    dns.getServers(),
          lookups:    [],
          reverses:   {},
          logg:       []
        },
        logit= msg => {rpt.logg.push([new Date() - tStart, msg])},
        ips  = {},
        loks = [],
        revs = [], // array of promises for reverse lookup
        lkup = dom => new Promise ((resolve, reject) => {
          var ider = 'lookup ' + dom + ' ';
          logit(ider + 'start');
          dns.lookup(dom, (err, address, family) => {
            if (!err) {
              logit(ider + address);
              rpt.lookups.push({dom: dom, address: address, family: family});
              ips[address] = [];
              resolve();
            } else {
              logit(ider + 'none');
              rpt.lookups.push({dom: dom, address: 'none'});
              resolve();              
            }
          });
        }),
        rvrs = address => new Promise ((resolve, reject) => {
          var ider = 'reverse ' + address + ' ';
          logit(ider + 'start');
          dns.reverse(address, (err, revhosts) => {
            logit(ider + (err?0:revhosts.length));
            ips[address] = err ? [] : revhosts;
            resolve();
          });
        }),
        rslv = (hostname, rrtype) => {
          var ider = 'resolve ' + rrtype + ' ',
            prom = new Promise ((resolve, reject) => {
            logit(ider + 'start');
            dns.resolve(hostname, rrtype, (err, hits) => {
              logit(ider + (err ? 'ERR: ' + err : 'done'));
              resolve(err?null:hits)
            });
          });
          loks.push(prom);
          prom.then (recs => {
            logit(ider + recs.length);
            rpt[rrtype] = recs;
            if (rrtype === 'A' || rrtype === 'AAAA')
              if (recs.length)
                for(let k=0, knt=recs.length; k<knt; ++k) {
                  ips[recs[k]] = [];
                }
          })
          .catch(err  => {
            logit(ider + 'ERR: ' + err);
          });
        };
      logit("lookup " + rqsthost);
      loks.push(lkup(rqsthost));
      for (let k=0, knt=subs.length; k<knt; ++k) {
        loks.push(lkup([subs[k], rqsthost].join('.')));
      }

      for(let k = 0; k < rrtypes.length; ++k)
        rslv(rqsthost, rrtypes[k]);
      logit('looking up');
      Promise.all(loks)
      .then( () => {
        logit("ips: " + Object.keys(ips).length);
        if (Object.keys(ips).length) {
          for (let ip in ips)
            revs.push(rvrs(ip));
          Promise.all(revs)
          .then( () => {
            resolve(rpt);
          });
        } else {
          logit("no ips found");
          resolve(rpt);
        }

      });
    }
  });
};
