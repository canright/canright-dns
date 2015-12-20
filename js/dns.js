"use strict";

var dns = require('dns');

var resolveRr = (hostname, resolver) => {
  return new Promise ((resolve, reject) => {
    resolver(hostname, (err, hits) => {resolve(err?null:hits)});
  });
};

exports.lookup = (rqsthost, subdoms) => {
  return new Promise ((resolve, reject) => {
    if (!rqsthost)
      reject("Domain name required");
    else {
      var rpt = {
        rqsthost: rqsthost,
        subdomains: subdoms?subdoms:[],
        servers: dns.getServers(),
        lookups: []
      };

      var look = (dom) => {
        return new Promise ((resolve, reject) => {
          dns.lookup(dom, (err, address, family) => {
            if (!err) {
              dns.reverse(address, (err, hostnames) => {
                rpt.lookups.push({dom: dom, address: address, family: family, hostnames: err?null:hostnames});
                resolve();
              });
            } else
              reject(err);
          });
        });
      };

      var chks = [];
      chks.push(look(rqsthost));
      for (let k=0, knt=subdoms.length; k<knt; ++k) {
        chks.push(look([subdoms[k], rqsthost].join(".")));
      }
      let pc = resolveRr(rqsthost, dns.resolveCname); chks.push(pc); pc.then((cnms) => {rpt.cnames = cnms});
      let pm = resolveRr(rqsthost, dns.resolveMx);    chks.push(pm); pm.then((mxs ) => {rpt.mxs    = mxs });
      let pn = resolveRr(rqsthost, dns.resolveNs);    chks.push(pn); pn.then((nss ) => {rpt.nss    = nss });
      let ps = resolveRr(rqsthost, dns.resolveSoa);   chks.push(ps); ps.then((soa ) => {rpt.soa    = soa });
      let pv = resolveRr(rqsthost, dns.resolveSrv);   chks.push(pv); pv.then((srvs) => {rpt.srvs   = srvs});
      let pt = resolveRr(rqsthost, dns.resolveTxt);   chks.push(pt); pt.then((txts) => {rpt.txts   = txts});
      Promise.all(chks)
      .then (()    => {
        resolve(rpt);
      })
      .catch((err) => {
        reject(err);
      });
    }
  //    dns.lookupService(address, 3000, (err, hostname, service) => {
  //      if (!err) {
  //        rpt.hostname = hostname;
  //        rpt.service = service;
  //        rpt.msgs.push("lookupService ok");
  //      } else
  //        rpt.msgs.push("lookupService error: " + err);
  //    });

  //  console.log("looking...");
  });
};
