'use strict';

const htmlPage = (title, body) =>
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

  out = (res, sta, pag) => {res.status(sta).send(pag);},
  rply = (res, pag) => out(res, 200, pag);

exports.htmlPage = htmlPage;
exports.reply = rply;

exports.generate = (isH, rpt) => {
  const hc = (h,c) => isH ? h : c,                                              // html or cli
    tit = s     => hc ('<hr>\n' + s + '\n<hr>\n<ul>', '-- ' + s + '-----'),     // section title
    end = ()    => hc ('</ul>', '-------------------'),                         // section end
    nl  = (n,l) => n + ' ' + hc('', ' '.repeat(l - n.length)),                  // name padded to length
    nn  = n     => nl(n,8),                                                     // short cut for labels
    ln  = s     => hc('<li>' + s + '</li>', s),                                 // one string line
    nv  = (n,v) => ln(nn(n) + JSON.stringify(v)),                               // name, value

    opv = (n,o) => {                                                            // object property value (name, object)
      var r = '';
      for (let p in o) {
        if (o.hasOwnProperty(p))
          r += ln( nn(n) + nl(p,12) + o[p]) + '\n  ';
      }
      return r;
    },

    pad = n => {                                                                // numeric left zero pad
      var s = '000000' + n + ': ';
      return s.substr(s.length-8);
    },

    al = a => {                                                                 // array lines
      var r = '';
      if (a)
        for (let k=0, knt=a.length;k<knt;++k)
          r += ln(pad(nn(a[k][0])) + a[k][1]) + '\n  ';
      return r;
    },

    aiv = (n, a)  => (a && a.length) ? a.map(v => ln(nl(n,8) + JSON.stringify(v))).join('\n  ') : ln(nl(n,8) + 'none');

  switch (rpt.type) {

    case 'servers':
      return `
  ${tit('DNS SERVERS')}
  ${aiv('SERVERS',rpt.servers)}
  ${end()}
  ${tit('EVENT LOG')}
  ${al (          rpt.evtlog)}
  ${end()}
`;

    case 'ip':
      return `
  ${tit('DNS REVERSE LOOKUP')}
  ${nv ('IP ADDR',rpt.rqstip)}
  ${aiv('HOSTS',  rpt.hosts)}
  ${end()}
  ${tit('EVENT LOG')}
  ${al (          rpt.evtlog)}
  ${end()}
`;

    case 'lookup':
       return `
  ${tit('DNS LOOKUP')}
  ${nv ('HOST',   rpt.rqsthost)}
  ${nv ('ADDRESS',rpt.address)}
  ${nv ('FAMILY', rpt.family)}
  ${end()}
  ${tit('EVENT LOG')}
  ${al (          rpt.evtlog)}
  ${end()}
`;

    case 'host':
      return `
  ${tit('DNS RESOLVE HOST')}
  ${nv ('HOST',   rpt.rqsthost)}
  ${nv ('SUBS',  rpt.rqstsubs)}
  ${aiv('NS',     rpt.NS)}
  ${opv('SOA',    rpt.SOA)}
  ${aiv('LOOK',   rpt.lookups)}
  ${aiv('A',      rpt.A)}
  ${aiv('CNAME',  rpt.CNAME)}
  ${aiv('AAAA',   rpt.AAAA)}
  ${aiv('MX',     rpt.MX)}
  ${aiv('SRV',    rpt.SRV)}
  ${nv ('TXT',    rpt.TXT)}
  ${end()}
  ${tit('EVENT LOG')}
  ${al (          rpt.evtlog)}
  ${end()}
`;
    default:
      return `
  ${tit('UNRECOGNIZED TYPE')}
`;
  }
};
