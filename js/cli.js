/*jslint node: true */
'use strict';

var inCli = false,
  reservoir = [];

const readline = require('readline'),
  dns = require('./dns'),
  out = require('./out'),
  cli = readline.createInterface(process.stdin, process.stdout),
  log = process.stdio,
  CLIOF = '',
  CLION = '> ',
  CLIER = '? ',
  CLINO = '. ',
  cliHelp =
`CLI commands:

= on entry to cli, logging is paused.
> help       -- this help

> resume -- flush queued logs and stream until paused.  Cli is still active.
> pause  -- pause log stream and queue lots until resumed.
> off    -- turn off cli, and resume log.
> exit   -- exit node.  Stop the server.
> now    -- echo current date and time
> dns    -- dns lookups
`,

  dnsHelp =
`Usage:

> dns servers                 -- list ip addresses for dns resolution servers from dns.getServers()
> dns $host                   -- quick lookup to get the ip address associated with $host.
> dns $host full              -- resolve dns for $host with lookups for default subdomains (www,mail,ftp,api,rest).
> dns $host $sub1 $sub2 $sub3 -- resolve dns for $host with lookup for subdomains in $subs.
> dns $ip                     -- reverse lookup of hosts for that ip address.

> dns $addr $port             -- returns hostname and service for an address and port using dns.lookupService

Examples:

> dns servers
> dns canright.com
> dns canright.com full
> dns canright.com www mail rest
> dns 192.168.41.171

> dns 127.0.0.1 22
`,

  say = s => {
    if (inCli)
      reservoir.push(s);
    else {
      let knt = reservoir.length;
      for (let k = 0; k < knt; ++k)
        console.log(reservoir.shift());
      console.log(s);
    }
  },

  ask = s => {console.log(s); cli.prompt();},

  exe = r => {
    switch (r[0]) {

      case 'pause':
        say('Logging is paused.');
        break;

      case 'resume':
        say('Logging is resumed.');
        break;

      case 'off':
        inCli = false;
        say('CLI is OFF. Enter empty line to turn it on.');
        cli.setPrompt(CLIOF);
        break;

     case 'exit':
        inCli = false;
        say('Exiting node');
        process.exit(0);
        break;

      case 'now':
        ask('It is ' + new Date());
        break;

      case 'dns':
        if (r.length<2) {
          ask(dnsHelp);
        } else {
          let host = r[1];
          if (host === 'servers') {
            cli.setPrompt(CLINO);
            dns.getServers()
            .then (rpt => {cli.setPrompt(CLION); ask(out.generate(0,rpt));})
            .catch(err => {cli.setPrompt(CLIER); ask('dns servers error: ' + err);});
          } else {
            let subs = [];
            if (r.length>2 && r[2]!=='full')
              for (let i=2;i<r.length;++i)
                subs.push(host);
            cli.setPrompt(CLINO);
            dns.resolve(host, subs, r.length>2)
            .then (rpt => {cli.setPrompt(CLION); ask(out.generate(0,rpt));})
            .catch(err => {cli.setPrompt(CLIER); ask('dns resolve error: ' + err);});
          }
        }
        break;

      case '':
      case 'help':
      default:
        ask(cliHelp);
        break;
    }
  };





exports.log = log;
exports.say = say;
exports.out = process.stdout;

console.log('CLI is OFF. Enter empty line to use.');
cli.setPrompt(CLIOF);

cli.on('close', () => {
  console.log('[> close]');
  process.exit(0);
});

cli.on('line', (line) => {
  if (!line.length && !inCli) {
    cli.setPrompt(CLION);
    inCli = true;
    ask('CLI is ON. Enter empty line for help.');
  } else
    if (inCli)
      exe(line.trim().split(' '));
    else
      say('CLI is off.  To turn on, enter empty line, not: ' + line);

  cli.prompt();
});
