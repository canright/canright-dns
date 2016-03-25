# Canright DNS

## Summary:

- Serves a REST HTTP interface for DNS lookups and DNS reporting through the node DNS module.

#### webserver.js exposes this REST HTTP GET interface:

- /dns/servers                  -- List the DNS servers used here.
- /dns/lookup/\<ipaddress\>     -- Reverse lookup of hosts for that ip address.        
- /dns/lookup/\<host\>          -- Lookup the IP Address for that hostname.   
- /dns/\<host\>                 -- Report DNS for the hostname with default lookups.
- /dns/\<host\>?subs=\<subs..\> -- Report DNS with lookups for host and listed subdomains.

#### server.js extends webserver.js with the cli module and these in js/commands.js.

- \> dns servers
- \> dns lookup \<ipaddress\>   
- \> dns lookup \<host\>        
- \> dns \<host\>               -- Default lookups are for the host and the 'www', 'ftp', and 'mail' subdomains.
- \> dns \<host\> sub sub ...   

#### Featues:

- Stack is javascript ES2015, node, npm, typescript, express, and mocha.
- Strives toward current best engineeering practices on target stack.
- Strives to fully harness and the target stack.
- Strives toward an expert Functional Programming approach.
- No external dependencies (only uses node and express).
- Demonstrates solid minimal node/express server with current best stack and practices.
- Single entry point (default: 'dns') is configurable.

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

#### Files:

- webserver.js    - implements web server.
- server.js       - implements web server with CLI interface.
- js/dns.js       - promises report data for a request.
- js/out.js       - responds with html or cli report from report data.
- js/commands.js  - implements CLI DNS commands.
- js/dnsrouter.js - express face for dns module.
