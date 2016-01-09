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

  report: {
    rqsthost: the hostname to resolve, like 'canright.com'.
    subdomains: the subdomains to lookup, like ["www", "ftp"].
    servers: array returned from dns.getServers(),
    lookups: array of the results of lookups for the host and subdomains
    NS: array of NS records resolved
    SOA: SAO record resolved.
    A: array of A records resolved.
    AAAA: array of AAAA records resolved.
    CNAME: array of CNAME records resolved.
    MX:  array of MX records resolved.
    TXT: array of TXT records resolved.
    SRV: array of SRV records resolved.
    PTR: array of PTR records resolved.
    REVERSE: array of ip addresses referenced each with an array of lookups{ip, reverses}
  }

  exports.lookupService(address, port) then(hostname)
*/

const dns = require('dns'),
  stds    = ['www', 'api', 'rest', 'mail', 'ftp'],
  rrtypes = ['NS', 'SOA', 'A', 'AAAA', 'CNAME', 'MX', 'TXT', 'SRV']; // 'PTR'
exports.lookup = (rqsthost, rqstsubs) => {
  var subs = rqstsubs.length ? rqstsubs : stds;
  return new Promise ((resolve, reject) => {
    if (!rqsthost)
      reject('Domain name required');
    else {
      var rpt = {
          rqsthost:   rqsthost,
          subdomains: subs,
          servers:    dns.getServers(),
          lookups:    [],
          reverses:   {}
        },
        ips  = {},
        loks = [],
        revs = [],
        lkup = dom => new Promise ((resolve, reject) => {
          dns.lookup(dom, (err, address, family) => {
            if (!err) {
              rpt.lookups.push({dom: dom, address: address, family: family});
              ips[address] = [];
              resolve();
            } else {
              rpt.lookups.push({dom: dom, address: 'none'});
              resolve();              
            }
          });
        }),
        rvrs = ip => new Promise ((resolve, reject) => {
          console.log('rvrs(%s)', ip);
          dns.reverse(address, (err, revhosts) => {
            if (!err) {
              ips[address] = revhosts;
              resolve();
            } else
              resolve();
          });
        }),
        rslv = (hostname, rrtype) => {

          var prom = new Promise ((resolve, reject) => {
            dns.resolve(hostname, rrtype, (err, hits) => {resolve(err?null:hits)});
          });
          loks.push(prom);
          prom.then (recs => {
            rpt[rrtype] = recs;
            if (rrtype === 'A' || rrtype === 'AAAA')
              if (recs)
                for(let k=0, knt=recs.length; k<knt; ++k) {
                  ips[recs[k]] = [];
                }
          })
          .catch(err  => {
            console.log('rslv(%s, %s) err: %s.', hostname, rrtype, err);
            console.log(`rslv(${hostname}, ${rrtype}) err: ${err}`)
          });
        };
      console.log('lookup root: %s.', rqsthost);
      loks.push(lkup(rqsthost));
      for (let k=0, knt=subs.length; k<knt; ++k) {
        loks.push(lkup([subs[k], rqsthost].join('.')));
      }

      for(let k = 0; k < rrtypes.length; ++k)
        rslv(rqsthost, rrtypes[k]);
      Promise.all(loks)
      .then( () => {
        console.log('lookups done with %d ips.', Object.keys(ips).length);
        if (Object.keys(ips).length) {
          for (let ip in ips) {
            revs.push(rvrs(ip));
          }
          for (let k=0, knt=revs.length; k<knt; ++k)
            console.log("REVERSES %s", JSON.stringify(revs[k]));
        } else {
          console.log('nothing in ips');

        }
        console.log("ips itterated: %d", revs.length);
        if (revs.length) {
          console.log("got revs (%d)", revs.length);
          Promise.all(revs)
          .then( () => {
            ()  => {
              console.log('with reverses...');
              resolve(rpt);
            },
            err => {
              console.log('reversing error: %s', err);
              resolve(rpt);
            }
          });
        } else {
          console.log("no reverses");
          resolve(rpt);
        }
      });
      }
  });
};
