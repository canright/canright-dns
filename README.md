# DNS Resolver

## Summary:

#### webserver.js serves a RESTful HTTP interface for DNS lookups and dns reporting through the node DNS module:

- /lookup/\<ipaddress\>             
- /lookup/\<host\>                  
- /dns/\<host\>                 
- /dns/\<host\>?subs=\<subs..\>

#### server.js adds a console CLI interface to the webserver.js RESTful interface:

- > lookup \<ipaddress\>           -- Reverse lookup of hosts for that ip address.
- > lookup \<host\>                -- Lookup the IP Address for that hostname.
- > dns \<host\>                   -- Report DNS for the hostname with default lookups.
- > dns \<host\> sub sub sub ...   -- Report DNS for the hostname with lookups for host and listed subdomains.

- Default lookups are for the host and the 'www', 'ftp', and 'mail' subdomains.

### Featues

- No external dependencies (only uses node and express).
- Stack is javascript ES2015, node v4.4 LTS or 5.x, express, and tdd with mocha/assert.
- Seeks to demonstrate Functional Programming and best advanced practices on that stack.
- Built with ES6/2015 - promises, template strings, arrow functions, ...
- Demonstrates minimalist node/express web server.

#### HTTP Request Examples:

- /lookup/google.com
- /lookup/192.168.92.15
- /dns/google.com
- /dns/google.com?subs=www,ftps

## CLI Examples:

- \> lookup google.com
- \> lookup 192.168.92.15
- \> dns google.com
- \> dns google.com www ftps

## Modules:

- server.js    - a minimal express web server to process requests like 'dns/:host?:subdomains.
- js/cli.js    - a cli interface.
- js/dns.js    - generates report data for an IP address or for a host domain and array of subdomains.
- js/out.js    - outputs report for html or cli.  Demonstrates functional programming.
- webserver.js - changes two lines of server.js to simply serve http with no cli.
