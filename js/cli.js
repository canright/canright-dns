"use strict";

const dns = require('./dns.js'),
  render = require('./render.js');

exports.initialize = () => {

  const stdin  = process.openStdin();

  console.log("serving cli requests like: ");
  console.log("> dns hostname, subdoms... ");
  console.log("example: ");
  console.log("> dns canright.com, www, ftp");

  stdin.addListener('data', function(d) {
    var o = JSON.parse(JSON.stringify(d));
    var lin = d.toString().trim();
    var rgs = lin.split(" ");
    var len = rgs.length;
    if (!len)
      console.log('Usage: dns');
    else {
      switch (rgs[0]) {
        case 'dns':
          if (len<2)
            console.log('Usage: dns hostname [subdomains]');
          else {
            let subs = [];
            if (len>2)
              for (var i=2;i<len;++i)
                subs.push(rgs[i]);
            dns.lookup(rgs[1], subs)
              .then (rpt => {console.log(render.report(0,rpt))})
              .catch(err => {console.log('dns.lookup error: %s', err)});
          }
          break;
          default:
            console.log('unrecognized command');
      }
    }
  });
}
