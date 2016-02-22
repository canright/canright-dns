# dns-resolver

## Summary:

- Consolidated dns resolves and lookups from the node dns module.
- No external dependencies (only uses node and express).
- Built with ES6/2015 - promises, template strings, arrow functions, ...
- Demonstrates simple CLI integrated with web server.
- Demonstrates functional programming.
- Demonstrates minimalist node/express web server.
- CLI is an optional mini-module.

## DNS report functions:

- lookup \<host\>               -- Quick lookup to get the ip address associated with host.
- resolve \<host\>              -- Resolve dns for host with lookups for default subdomains.
- reverse \<ipaddress\>         -- Reverse lookup of hosts for that ip address.
- resolve \<host\> \<subs..\>   -- Resolve dns for host with lookups for listed subdomains.
                                -- default subdomains: @ (root), 'www', 'ftp' and 'mail'.

## From a browser:

- ../dns/\<host\>               -- Lookup host.
- ../dns/\<host\>?full          -- Resolve host.
- ../dns/\<ipaddress\>          -- Reverse lookup ip address.
- ../dns/\<host\>?subs=\<subs\> -- Resolve host with subdomains.

#### HTTP Request Examples:

- ../dns/google.com
- ../dns/google.com?full
- ../dns/192.168.92.15
- ../dns/google.com?subs=www,ftps


## From CLI:

- \> help  -- This help.
- \> off   -- Turn off CLI
- \> exit  -- Exit node.  Stop the server.
- \> now   -- Echo current date and time.

- \> dns \<host\>               -- Lookup host.
- \> dns \<host\> full          -- Resolve host.
- \> dns \<ipaddress\>          -- Reverse lookup ip address.
- \> dns \<host\> \<subs..\>    -- Resolve host with subdomains.

#### CLI Examples:

- \> dns google.com
- \> dns google.com full
- \> dns 192.168.92.15
- \> dns google.com www ftp

## Modules:

- server.js    - a minimal express web server to process requests like 'dns/:host?:subdomains.
- js/cli.js    - a cli interface.
- js/dns.js    - generates report data for an IP address or for a host domain and array of subdomains.
- js/out.js    - outputs report for html or cli.  Demonstrates functional programming.
- webserver.js - changes two lines of server.js to simply serve http with no cli.
- 
