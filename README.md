# dns

### Summary:

- consolidated dns resolves and lookups from the node dns module.
- CLI integrated with web server.
- No external dependencies (only uses node and express)
- Built with ES6/2015 - promises, template strings, arrow functions, ...

### DNS report functions:

- 'dns ipaddress' reports on that IP address.  Reverse lookup to discover domain names
- 'dns host' reports name server records for host with IP address lookups for these default subdomains (@, www, ftp, mail)
- 'dns host subdomains' reports dies the same with host and listed rather than default subdomains.

### From cli:

- > help  -- this help
- > off   -- turn off cli
- > exit  -- exit node.  Stop the server.
- > now   -- echo current date and time
- > dns google.com          -- quick lookup to get the ip address associated with host.
- > dns google.com full     -- resolve dns for host with lookups for default subdomains (www,mail,ftp,api,rest).
- > dns google.com www ftps -- resolve dns for host with lookup for listed subdomains.
- > dns 192.168.92.15       -- reverse lookup of hosts for that ip address.

### From a browser:

- www.yourhost.com/dns/google.com               -- quick lookup to get the ip address associated with host.
- www.yourhost.com/dns/google.com?full          -- resolve dns with lookups for default subdomains (www,mail,ftp,api,rest).
- www.yourhost.com/dns/google.com?subs=www,ftps -- resolve dns for host with lookup for listed subdomains.
- www.yourhost.com/dns/192.168.92.15            -- reverse lookup of hosts for that ip address.

### Modules:

server.js - a minimal express web server to process requests like 'dns/:host?:subdomains.
js/cli.js - a cli interface.
js/dns.js - generates report data for an IP address or for a host domain and array of subdomains.
js/out.js - outputs report for html or cli
