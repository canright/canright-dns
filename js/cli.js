"use strict";

const dns = require('./dns.js'),
  readline = require('readline'),
  render = require('./render.js'),
  cli = readline.createInterface(process.stdin, process.stdout);

var inCli = false,
  reservoir = [];

console.log("- CLI OFF. Enter empty line to use.");
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

cli

  .on('close', () => {
    console.log('[> close]');
    process.exit(0);
  })

  .on('line', (line) => {
    var lin = line.trim();
    var rgs = lin.split(" ");
    var len = rgs.length;
    if (!line.length)
      if (inCli) {
        inCli = false;
        say("- CLI OFF. Enter empty line to resume.");
        cli.setPrompt('');
      } else {
        say("- CLI ON. Enter empty line to quit.");
        inCli = true;
        cli.setPrompt('> ');
        cli.prompt();
      }
    else
        if (inCli)
          switch (rgs[0]) {
            case 'dns':
              if (len<2) {
                console.log('Usage: dns hostname [subdomains]');
                cli.prompt();
              } else {
                let subs = [];
                if (len>2)
                  for (var i=2;i<len;++i)
                    subs.push(rgs[i]);
                dns
                  .lookup(rgs[1], subs)
                  .then (rpt => {
                    console.log(render.report(0,rpt));
                    cli.prompt();
                  })
                  .catch(err => {
                    console.log('dns.lookup error: %s', err)
                    cli.prompt();
                  });
              }
              break;
            default:
              console.log('unknown command.  try "dns"');
              cli.prompt();
          }
        else
          console.log('CLI is off.  To turn on, enter empty line, not: "%s"', line);

    cli.prompt();
  })
