
## Serves a REST HTTP interface for DNS lookups and DNS reporting through the node DNS module.

#### webserver.js exposes this REST HTTP GET interface:

- /dns/servers               -- List the DNS servers used here.
- /dns/lookup/${ipaddress}   -- Reverse lookup of hosts for that ip address.        
- /dns/lookup/${host}        -- Lookup the IP Address for that hostname.   
- /dns/${host}               -- Report DNS for the hostname with default lookups.
- /dns/${host}?subs=\${subs} -- Report DNS with lookups for host and listed subdomains.

#### server.js extends webserver.js with the cli module and these lib/commands.js.

- \> dns servers
- \> dns lookup ${ipaddress}   
- \> dns lookup ${host}        
- \> dns ${host}             -- Default lookups are for the host and the 'www', 'ftp', and 'mail' subdomains.
- \> dns ${host} ${sub1} ${sub2} ...   

#### Featues:

- Stack is javascript ES2015, node, npm, typescript, express, and mocha.
- Strives for current best stack and best lean engineeering practices.
- Strives to demonstrate expert functional programming in javascript ES6.
- No external dependencies beyond this stack.
- Demonstrates solid minimal node/express server with current best stack and practices.
- Single entry point (default: 'dns') is configurable.

#### HTTP Request Examples:

- /dns/servers
- /dns/lookup/google.com
- /dns/lookup/192.168.92.15
- /dns/google.com
- /dns/google.com?subs=www,ftps

#### CLI Examples

- \> dns servers
- \> dns lookup google.com
- \> dns lookup 192.168.92.15
- \> dns google.com
- \> dns google.com www ftps

#### Files:

- webserver.js     - implements web server.
- server.js        - implements web server with CLI interface.
- lib/dns.js       - promises report data for a request.
- lib/out.js       - responds with html or cli report from report data.
- lib/commands.js  - implements CLI DNS commands.
- lib/dnsrouter.js - express face for dns module.
