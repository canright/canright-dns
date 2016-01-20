'use strict';

const xp = require('express'),
  morgan = require('morgan'),
  parser = require('body-parser'),
  stdin  = process.openStdin(),
  app    = xp();

app.use(parser.json());
app.use(parser.urlencoded({ extended: false }));
app.use(morgan('dev'));

console.log('- Serving: localhost:%s\n', process.env.PORT || 3000);

app.get('/dns.html', (req, res) => {res.sendFile(req, res, '/dns.html')});

const render = (isH, rpt) => {
  const n8  = n     => isH ? n + ' ' : n + ' '.repeat(8 - n.length);
  const n0  = n     => isH ? n + ' ' : n + ' '.repeat(12- n.length);
  const ln  = s     => isH ? '<li>' + s + '</li>' : s;    // one line string
  const nv  = (n,v) => ln(n8(n) + JSON.stringify(v));     // name, value
  const opv = (n,o) => {                                  // object property values (name, object)
    var r = '';
    for (var p in o) {
      if (o.hasOwnProperty(p))
        r += ln( n8(n) + n0(p) + o[p]) + '\n  ';
    }
    return r;
  }

// array values (name, array)
  const aiv = (n, a)  => a ? a.map(v => ln(n8(n) + JSON.stringify(v))).join('\n  ')
                           : ln(n8(n) + 'none');
  return `
  ${isH?'<ul>':'-- DNS LOOKUP -----'}
  ${nv ('HOST',   rpt.rqsthost)}
  ${nv ('SUBS',   rpt.subdomains)}
  ${aiv('SERVER', rpt.servers)}
  ${aiv('NS',     rpt.NS)}
  ${opv('SOA',    rpt.SOA)}
  ${aiv('LOOK',   rpt.lookups)}
  ${aiv('A',      rpt.A)}
  ${aiv('AAAA',   rpt.AAAA)}
  ${aiv('CNAME',  rpt.CNAME)}
  ${aiv('MX',     rpt.MX)}
  ${aiv('SRV',    rpt.SRV)}
  ${nv ('TXT',    rpt.TXT)}
  ${isH?'</ul>':'-------------------'}
  ${isH?'<hr>':''}
  ${isH?'<!--':''}
${isH?JSON.stringify(rpt):''}
  ${isH?'-->':''}
`;
}

const dns = require('./js/dns.js');

/*
app.get("/dns/:host/:subs", (req, res) => {
*/
app.get('/dns/*', (req, res) => {

  var prts = req.path.slice(5).split(',');

  if (!prts.length)
    res.status(404).send('an interesting query...<br>try /dns/host/subs');
  else {
    var host = prts[0];
    var subs = (prts.length>1)? prts.slice(1):[];

    dns.lookup(host, subs)
    .then (rpt => {res.status(200).send(render(1,rpt))})
    .catch(err => {res.status(500).send(`dns.lookup error: ${err}`)});
  }
});

app.listen(process.env.PORT || 3000);

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
              .then (rpt => {console.log(render(0,rpt))})
              .catch(err => {console.log('dns.lookup error: %s', err)});
          }
          break;
        default:
          console.log('unrecognized command');
      }
    }
  });

module.exports = app;
