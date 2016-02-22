# dns-resolver

### Summary:

- consolidated dns resolves and lookups from the node dns module.
- No external dependencies (only uses node and express).
- Built with ES6/2015 - promises, template strings, arrow functions, ...
- demonstrates simple CLI integrated with web server.
- demonstrates functional programming
- demonstrates minimalist node/express web server.
- cli is an optional mini-module.

### DNS report functions:

- 'dns \<ipaddress\>' -- reports the domain names from a reverse lookup of that IP address.
- 'dns \<host\>'      -- reports name server records for host
- 'dns \<host\>' also reports IP address lookups for default subdomains (@, www, ftp, mail).
- 'dns \<host\> <subdomains>' reports for listed subdomains.

### From cli:

- \> help  -- this help
- \> off   -- turn off cli
- \> exit  -- exit node.  Stop the server.
- \> now   -- echo current date and time

- \> dns \<host\>          -- quick lookup to get the ip address associated with host.
- \> dns \<host\> full     -- resolve dns for host with lookups for default subdomains.
- \> dns \<ipaddress\>     -- reverse lookup of hosts for that ip address.
- \> dns \<host\> \<subs..\> -- resolve dns for host with lookups for it, www, and ftp.

#### Examples:

- \> dns google.com          -- quick lookup to get the ip address associated with host.
- \> dns google.com full     -- resolve dns for host with lookups for default subdomains.
- \> dns 192.168.92.15       -- reverse lookup of hosts for that ip address.
- \> dns google.com www ftp  -- resolve dns for host with lookups for it, www, and ftp.

### From a browser:

- ../dns/\<host\>             -- quick lookup to get the ip address associated with host.
- ../dns/\<host\>?full        -- resolve dns with lookups for default subdomains.
- ../dns/\<ipaddress\>        -- reverse lookup of hosts for that ip address.
- ../dns/\<host\>?subs=\<subs\> -- resolve dns for host with lookup for listed subdomains.

#### Examples:

- ../dns/google.com         -- quick lookup to get the ip address associated with host.
- ../dns/google.com?full    -- resolve dns with lookups for default subdomains.
- ../dns/192.168.92.15            -- reverse lookup of hosts for that ip address.
- ../dns/google.com?subs=www,ftps -- resolve dns for host with lookup for listed subdomains.

### Modules:

server.js    - a minimal express web server to process requests like 'dns/:host?:subdomains.
js/cli.js    - a cli interface.
js/dns.js    - generates report data for an IP address or for a host domain and array of subdomains.
js/out.js    - outputs report for html or cli.  Demonstrates functional programming.
webserver.js - changes two lines of server.js to simply serve http with no cli.

