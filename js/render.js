'use strict';

exports.report = (isH, rpt) => {
  const nl  = (n,l) => n + ' ' + (isH ? '' : ' '.repeat(l - n.length)); // name padded to length + 1 space
  const ln  = s     => isH ? '<li>' + s + '</li>' : s;    // one string line
  const nv  = (n,v) => ln(nl(n,8) + JSON.stringify(v));     // name, value
  const opv = (n,o) => {                                  // object property value (name, object)
    var r = '';
    for (var p in o) {
      if (o.hasOwnProperty(p))
        r += ln( nl(n,8) + nl(p,12) + o[p]) + '\n  ';
    }
    return r;
  }

// array values (name, array)
  const aiv = (n, a)  => a ? a.map(v => ln(nl(n,8) + JSON.stringify(v))).join('\n  ')
                           : ln(nl(n,8) + 'none');
  return `
  ${isH?'<hr>\nDNS LOOKUP\n<hr>\n<ul>':'-- DNS LOOKUP -----'}
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
};
