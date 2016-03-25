# Canright DNS

## Summary:

#### Serves a REST HTTP interface for DNS lookups and DNS reporting through the node DNS module.

#### webserver.js exposes the REST HTTP interface with one (changable) entry point (defaults to 'dns')

- /dns/servers                  -- List the DNS servers used here.
- /dns/lookup/\<ipaddress\>     -- Reverse lookup of hosts for that ip address.        
- /dns/lookup/\<host\>          -- Lookup the IP Address for that hostname.   
- /dns/\<host\>                 -- Report DNS for the hostname with default lookups.
- /dns/\<host\>?subs=\<subs..\> -- Report DNS with lookups for host and listed subdomains.

#### server.js extends webserver.js to include the cli module and this console CLI interface:

- \> dns servers
- \> dns lookup \<ipaddress\>   
- \> dns lookup \<host\>        
- \> dns \<host\>               -- Default lookups are for the host and the 'www', 'ftp', and 'mail' subdomains.
- \> dns \<host\> sub sub ...   

#### Featues:

- No external dependencies (only uses node and express).
- Stack is javascript ES2015, typescript, node, npm, express, and mocha.
- Seeks to demonstrate Functional Programming and best software engineering practices on target stack.
- Built with ES6/2015 - promises, template strings, arrow functions, ...
- Demonstrates solid minimal node/express server with current best stack and practices.

#### HTTP Request Examples (webserver.js and server.js):

- /dns/servers
- /dns/lookup/google.com
- /dns/lookup/192.168.92.15
- /dns/google.com
- /dns/google.com?subs=www,ftps

#### CLI Examples (server.js)

- \> dns servers
- \> dns lookup google.com
- \> dns lookup 192.168.92.15
- \> dns google.com
- \> dns google.com www ftps

#### Supporting Modules:

- js/dnsrouter.js - express face for dns module
- js/dns.js       - generates report object for an IP address or for a host domain and array of subdomains.
- js/out.js       - outputs report for html or cli.  Demonstrates functional programming.
- js/cli.js       - cli interface.
