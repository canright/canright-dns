# dns

Summary:
- consolidated dns resolves and lookups from the node dns module.
- uses ES6 features
- cli integrated with web server
- no external dependencies (only uses node and express)
- ES6/2015 - promises, template strings, arrow functions, ...

DNS report functions:
- 'dns ipaddress' reports on that IP address.  Reverse lookup to discover domain names
- 'dns host' reports name server records for host with IP address lookups for these default subdomains (@, www, ftp, mail)
- 'dns host subdomains' reports dies the same with host and listed rather than default subdomains.

From cli:
- > help  -- this help
- > off   -- turn off cli
- > exit  -- exit node.  Stop the server.
- > now   -- echo current date and time
- > dns google.com          -- quick lookup to get the ip address associated with host.
- > dns google.com full     -- resolve dns for host with lookups for default subdomains (www,mail,ftp,api,rest).
- > dns google.com www ftps -- resolve dns for host with lookup for listed subdomains.
- > dns 192.168.92.15       -- reverse lookup of hosts for that ip address.

From a browser:
- www.yourhost.com/dns/google.com               -- quick lookup to get the ip address associated with host.
- www.yourhost.com/dns/google.com?full          -- resolve dns for host with lookups for default subdomains (www,mail,ftp,api,rest).
- www.yourhost.com/dns/google.com?subs=www,ftps -- resolve dns for host with lookup for listed subdomains.
- www.yourhost.com/dns/192.168.92.15            -- reverse lookup of hosts for that ip address.

The dns.js module prepares report data from results 

server.js - a minimal express web server to process requests like 'dns/:host?:subdomains.
js/cli.js - a cli interface.
js/dns.js - generates report data for an IP address or for a host domain and array of subdomains.
js/out.js - outputs report for html or cli

The dns report generater in dns.js implements this pseudocode using node dns and promises to generate the report data:

function dns(host) {
  dns.getServers();
  if (host is an IP address) {
    dns.reverse(host) // list of domains associated with the IP address
  } else { // host is domain name
    dns.resolve
    dns.resolve(host with each of "NS", "SOA", "A", "AAAA", "CNAME", MX", "TXT", "SRV", "PTR")
    dns.lookup(base host and each of host's subdomains in subs)
    dns.reverse for IP addresses looked up
  }
}
  
domain report: {
    rqsthost: the hostname to resolve, like 'canright.com',
    type:     'domain',
    subdoms:  [subdomains to lookup],
    servers:  [DNS servers from dns.getServers()],
    lookups:  [results of lookups for the host and subdomains],
    ips:      {ipaddress: [domains from reverse lookups]},
    evtlog:   [[ms,msg]] timemarked event log,
    ns:       [NS records resolved],
    soa:      {SAO record resolved},
    a:        [A records resolved],
    aaaa:     [AAAA records resolved],
    cname:    [CNAME records resolved],
    mx:       [MX records resolved],
    txt:      [TXT records resolved],
    srv:      [SRV records resolved],
    ptr:      [PTR records resolved],
}

IP report: {
    rqsthost: the IP address to reverse lookup, like '198.145.41.172',
    type:     'domain',
    type:     'ip',
    servers: [DNS servers from dns.getServers()],
    domains: [associated domains from reverse lookup]
}

out.js 
