/*jslint node: true */
'use strict';

const cli = require('./cli'),
  ask = s => {console.log(s); cli.con.prompt()},
  heys = ['there', 'now', 'good looking', 'is for horses'],
  help = `

> dns servers              -- List Primary Domain Name Servers.
> dns lookup <ip_address>  -- Reverse lookup of hosts for that ip address.
> dns lookup <host>        -- Lookup the IP Address for that hostname.
> dns <host>               -- Report DNS for the hostname with default lookups.
> dns <host> sub sub ...   -- Report DNS with lookups for host and listed subdomains.

> now                      -- Echo date and time.`;

function exe(r) {
  switch(r[0]) {

    case 'now':
      ask('It is ' + new Date());
      break;

	case 'dns':
	  if (r.length<2)
	    ask(help);
	  else {
	  	switch(r[1]) {
	  	  case 'servers':
	        cli.setPrompt(CLINO);
	        dns.getServers()
	        .then (rpt => {cli.setPrompt(CLION); ask(out.generate(0,rpt));})
	        .catch(err => {cli.setPrompt(CLIER); ask('dns servers error: ' + err);});
	        break;
	      case 'lookup':
	        if (r.length<3)
	          ask(help);
	          else {
	          	let target = r[2];
	          	if (dns.isIp(target)) {
	          	  dns.reverseIp(target)
	              .then (rpt => {cli.setPrompt(CLION); ask(out.generate(0,rpt));})
	              .catch(err => {cli.setPrompt(CLIER); ask('dns reverseIp error: ' + err);});
	          	} else {
	          	  dns.lookupHost(target)
	              .then (rpt => {cli.setPrompt(CLION); ask(out.generate(0,rpt));})
	              .catch(err => {cli.setPrompt(CLIER); ask('dns lookupHost error: ' + err);});
	          	}
	          }
	        break;
	      default:
	        let target = r[1];
	        if (r.length == 2)
	          dns.resolveHost(target, [])
	          .then (rpt => {cli.setPrompt(CLION); ask(out.generate(0,rpt));})
	          .catch(err => {cli.setPrompt(CLIER); ask('dns resolveHost error: ' + err);});
	        else
	          dns.resolveHost(target, [r[2]])
	          .then (rpt => {cli.setPrompt(CLION); ask(out.generate(0,rpt));})
	          .catch(err => {cli.setPrompt(CLIER); ask('dns resolveHostSubs error: ' + err);});
	        break; 
	  	}
	  }
	  break;
	default:
      ask(`command arguments: ${r.map(s=>s)}
OK?`);
      break;
  }
}
exports.help = help;
exports.exe = exe;

/*
lookup <ipaddress>       -- Reverse lookup of hosts for that ip address.
lookup <host>            -- Lookup the IP Address for that hostname.
dns <host>               -- Report DNS for the hostname with default lookups.
dns <host> sub sub ...   -- Report DNS with lookups for host and listed subdomains.
*/