# REST DNS

## Summary:

#### Serves a RESTful HTTP interface for DNS lookups and DNS reporting through the node DNS module.

#### webserver.js exposes the RESTful HTTP interface:

- /dns/servers
- /dns/lookup/\<ipaddress\>             
- /dns/lookup/\<host\>                  
- /dns/\<host\>                 
- /dns/\<host\>?subs=\<subs..\>

#### server.js adds a console CLI interface:

- \> dns lookup \<ipaddress\>   -- Reverse lookup of hosts for that ip address.
- \> dns lookup \<host\>        -- Lookup the IP Address for that hostname.
- \> dns \<host\>               -- Report DNS for the hostname with default lookups.
- \> dns \<host\> sub sub ...   -- Report DNS with lookups for host and listed subdomains.

- Default lookups are for the host and the 'www', 'ftp', and 'mail' subdomains.

#### Featues:

- No external dependencies (only uses node and express).
- Stack is javascript ES2015, node v4.4 LTS or 5.x, express, and tdd with mocha/assert.
- Seeks to demonstrate Functional Programming and best advanced practices on that stack.
- Built with ES6/2015 - promises, template strings, arrow functions, ...
- Demonstrates minimalist node/express web server.

#### HTTP Request Examples:

- /dns/lookup/google.com
- /dns/lookup/192.168.92.15
- /dns/google.com
- /dns/google.com?subs=www,ftps

#### CLI Examples:

- \> dns lookup google.com
- \> dns lookup 192.168.92.15
- \> dns google.com
- \> dns google.com www ftps

#### Server Modules

- webserver.js    - a minimal web server for RESTful DNS lookups and reports.
- server.js       - adds console cli to webserver.js.

#### Supporting Modules:

- js/dnsrouter.js - express face for dns module
- js/dns.js       - generates report object for an IP address or for a host domain and array of subdomains.
- js/out.js       - outputs report for html or cli.  Demonstrates functional programming.
- js/cli.js       - cli interface.
