"use strict";

const readline = require('readline'),
  dns = require('./dns.js'),
  out = require('./out.js'),
  cli = readline.createInterface(process.stdin, process.stdout);

const cliHelp =
`CLI commands:
> help  -- this help
> off   -- turn off cli.  flush suspended output, resume console log.
> exit  -- exit node.  Stop the server.
> now   -- echo current date and time
> dns   -- dns lookups
`;

const dnsHelp =
`Usage:

> dns host       -- quick lookup to get the ip address associated with host.
> dns host full  -- resolve dns for host with lookups for default subdomains (www,mail,ftp,api,rest).
> dns host subs  -- resolve dns for host with lookup for listed subdomains.
> dns ip         -- reverse lookup of hosts for that ip address.

Examples:

> dns canright.com 
> dns canright.com full
> dns canright.com www mail rest
> dns 192.168.41.171
`;

var inCli = false,
  reservoir = [];

console.log("CLI is OFF. Enter empty line to use.");
cli.setPrompt('');

var say = s => {
  if (inCli)
    reservoir.push(s);
  else {
    let knt = reservoir.length;
    for (var k=0;k<knt;++k)
      console.log(reservoir.shift());
    console.log(s);
  }
}
exports.say = say;

var ask = s => {console.log(s); cli.prompt()};

cli.on('close', () => {
  console.log('[> close]');
  process.exit(0);
});

cli.on('line', (line) => {
  var lin = line.trim();
  var rgs = lin.split(" ");
  var len = rgs.length;
  if (!line.length)
    if (inCli)
      ask(cliHelp);
    else {
      cli.setPrompt('> ');
      inCli = true;
      ask("CLI is ON. Enter empty line for help.");
    }
  else
      if (inCli)
        switch (rgs[0]) {
          case '':
          case 'help':
            ask(cliHelp);
            break;

          case 'off':
            inCli = false;
            say("CLI is OFF. Enter empty line to turn it on.");
            cli.setPrompt('');
            break;

          case 'now':
            ask('It is ' + new Date());
        //  ask('It is ' + new Date() + '\n' + Date.now());
            break;

          case 'exit':
            ask('Exiting node');
            process.exit(0);
            break;

          case 'dns':
            if (len<2) {
              ask(dnsHelp);
            } else {
              let host = rgs[1],
                subs = [],
                full;
              if (len>2)
                if (rgs[2]==='full')
                  full = true;
                else {
                  for (var i=2;i<len;++i)
                    subs.push(rgs[i]);
                }
              cli.setPrompt('...');
              dns.resolve(host, subs, full)
              .then (rpt => {cli.setPrompt('>'); ask(out.generate(0,rpt))})
              .catch(err => {cli.setPrompt('?'); ask('dns resolve error: ' + err)});
            }
            break;

          default:
            ask('Unknown command.  Try "dns" or "now".');
        }

      else
        say('CLI is off.  To turn on, enter empty line, not: ' + line);

  cli.prompt();
  })
