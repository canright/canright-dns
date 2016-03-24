/*jslint node: true */
'use strict';

const dns = require('../js/dns'),
  assert  = require('assert');

const len       = a               => !!a?a.length:0,
  positiveTests = (fn, vals)      => it ('positive tests', () => vals.map(s => assert( fn(s), s))),
  negativeTests = (fn, vals)      => it ('negtive tests' , () => vals.map(s => assert(!fn(s), s))),
  serversCount  = k               => it ('getServers', () => assert(len(dns.dns_servers())===k, 'getServers')),
  testCount     = (fn, key, k)    => it (key, () => fn(key).then(a => assert(len(a)===k, key))),
  reverseCount  = (ip, k)         => testCount(dns.dns_reverse, ip, k),
  resolveCount  = (typ, host, k)  => it (`${typ}: ${host}`, () => dns.dns_resolve(host, typ).then(rs => assert(len(rs)===k), `${typ}: ${host}`)),

  lookupNone    = (host)          => it (host             , () => dns.dns_lookup(host)      .then(r  => assert(JSON.stringify(r) === JSON.stringify({}), host))),
  lookupTest    = (host, x)       => it (host             , () => dns.dns_lookup(host)      .then(r  => assert(r.address===x, host))),
  reverseTest   = (ip, x)         => it (ip               , () => dns.dns_reverse(ip )      .then(rs => assert(rs[0]===x, ip))),
  resolveTest   = (typ, host, x)  => it (`${typ}: ${host}`, () => dns.dns_resolve(host, typ).then(rs => assert(rs[0]===x, `${typ}: ${host}`))),
  resolveProp   = (typ, host,p,x) => it (`${typ}: ${host}`, () => dns.dns_resolve(host, typ).then(rs => assert(rs[p]===x, `${typ}: ${host}`))),
  resolvNS      = (typ, host, x)  => it (`${typ}: ${host}`, () => dns.dns_resolve(host, typ).then(rs => assert(rs[0]===x, `${typ}: ${host}`))),
  resolving     = (typ, host)     => it (`${typ}: ${host}`, () => dns.dns_resolve(host, typ).then(rs => {
  	console.log(`${typ}: ${host} :: ${JSON.stringify(rs)}.`);
  	assert(rs.length, `${typ}: ${host}`);
  })),
  report_0      = (fn,         pn, pv) => it (pv                         , () => fn             ()      .then(o  => assert(o[pn] === pv,              `${pn}: ${pv}`))),
  report_1      = (fn, a1,     pn, pv) => it (a1                         , () => fn             (a1)    .then(o  => assert(o[pn] === pv,       `${a1}; ${pn}: ${pv}`))),
  report_2      = (fn, a1, a2, pn, pv) => it (`${a1}-${a2}; ${pn}: ${pv}`, () => fn             (a1, a2).then(o  => assert(o[pn] === pv, `${a1}-${a2}; ${pn}: ${pv}`))),
  rptResolve    = (    a1,     pn, pv) => it (      `${a1}; ${pn}: ${pv}`, () => dns.resolveHost(a1, []).then(o  => assert(o[pn] === pv,       `${a1}; ${pn}: ${pv}`))),
  reportResolve = (    a1, a2, pn, pv) => it (`${a1}-${a2}; ${pn}: ${pv}`, () => dns.resolveHost(a1, a2).then(o  => assert(o[pn] === pv, `${a1}-${a2}; ${pn}: ${pv}`)));

describe('dns', function() {
  describe('truthify', function() {
    positiveTests(dns.truthify, [true, !false, !!true, -1, !0, 999, 'canright', 0!=1, 1==1], {});
    negativeTests(dns.truthify, [false, !true, !!false, 0, !1, undefined, null, '', 1==2], []);
  });

  describe('isIp', function() {
    positiveTests(dns.isIp, ['0.0.0.0', '255.255.255.255', '1.2.3.4', '198.145.41.172']);
    negativeTests(dns.isIp, ['1','1.2', '1.2.3', '1.2.3.', '1.2.3.256', 'canright.com']);
  });
  describe('isHost', function(){
    positiveTests(dns.isHost, ['www.canright.com', 'nice.canright.com', 'canright.com', 'canright.ws',
                               'canright.an', 'ca.com', 'can.ws', 'ca.an']);
    negativeTests(dns.isHost, ['canright.n', 'c.an', 'c.com', '.can.com', '198.145.41.172']);
  });

  describe('dns_servers', function() {
  	serversCount(1);
  });

  describe('dns_lookup', function() {
  	lookupNone ('jimcanrightxx.com');
    lookupTest ('canright.com'    , '198.145.41.172');
    lookupTest ('www.canright.net', '198.145.41.172');
  });

  describe('dns_reverse', function() {
    reverseTest ('74.125.28.99', 'pc-in-f99.1e100.net');
    reverseCount('198.145.41.172', 0);
    reverseCount('216.58.194.110', 1);
  });

  describe('dns_resolve', function() {
    resolveTest ('A',     'canright.com',     '198.145.41.172');
    resolveTest ('A',     'www.canright.com', '198.145.41.172');
    resolveTest ('A',     'canright.net',     '198.145.41.172');
    resolveTest ('A',     'www.canright.net', '198.145.41.172');
    resolveCount('NS',    'canright.com', 2);
    resolveProp ('SOA',   'canright.com', 'nsname', 'NS41.WORLDNIC.com');
    resolveCount('A',     'canright.com', 1);
    resolveCount('AAAA',  'canright.com', 0);
    resolveCount('CNAME', 'canright.com', 0);
    resolveCount('MX',    'canright.com', 5);
    resolveCount('TXT',   'canright.com', 0);
    resolveCount('SRV',   'canright.com', 0);
  });

  describe('getServers', function() {
    report_0(dns.getServers, 'type', 'servers');
  });
  describe('lookupHost', function() {
    report_1(dns.lookupHost, 'canright.com', 'type', 'lookup');
  });

  describe('reverseIp', function() {
    report_1(dns.reverseIp, '216.58.194.110', 'type', 'ip');
  });

  describe('resolveHost', function() {
    rptResolve('canright.com', 'type', 'host');
    reportResolve('canright.com', ['www','ftp'], 'type', 'host');
  });

});
