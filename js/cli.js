"use strict";

var dns = require('./js/dns.js');

/* console dialog */
var kArgs = process.argv.length;

if (kArgs > 2) // Immediate execute command line arguments
  consoleLookUp(process.argv[2], (kArgs>3)?process.argv.slice(3):[]);
else {

/* Web Server */

  var express     = require("express"),
    morgan        = require("morgan"),
    bodyParser    = require("body-parser"),
    app           = express();

  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({ extended: false }));
  app.use(morgan("dev"));

  console.log("- Serving: localhost:%s\n", process.env.PORT || 3000);
  console.log("dns hostname, subdoms... ");
  console.log("dns canright.com, www, ftp (example)");

  app.get("/dns", (req, res) => {
    res.status(200)
       .send("dns report requested");
  });

  app.listen(process.env.PORT || 3000);

  var stdin = process.openStdin();

  stdin.addListener("data", function(d) {
  	console.log("^^^%s^^^", JSON.stringify(JSON.parse(JSON.stringify(d))));
  	console.log("type: %s!",d["type"]);
  	console.log("data: %s!",JSON.stringify(d.data));
  	var lin = d.toString().trim();
  	console.log("lin=%s=", lin);
  	var rgs = lin.split(" ");
  	var len = rgs.length;
  	if (!len)
  	  console.log("Usage: dns");
  	else {
  	  console.log("=======len=%d=======", len);
      switch (rgs[0]) {
  	    case "dns":
  	      if (len<2)
  	      	console.log("Usage: dns hostname [subdomains]");
  	      else {
  	      	if (len<3)
              consoleLookup(rgs[1], []);
            else {
              let subs = [];
              for (var i=2;i<len;++i)
              	subs.push(rgs[i]);
              consoleLookup(rgs[1], subs);
            }
  	      }
  	      break;
  	    default:
  	      console.log("unrecognized command");
  	  }
  	}
	console.log("=%s=", JSON.stringify(d));
    console.log("#" + d.toString().trim() + "#");
  });

  module.exports = app;
}

var consoleLookup = (host, subs) => {

  console.log("looking...");

  dns.lookup(host, subs)
  .then ((rpt) => {
  	reportOut(rpt);
  })
  .catch((err) => {
    console.log("Fail: %s", err);
  });
}

var reportOut = ((rpt) => {

  console.log("DOMAIN: %s", rpt.rqsthost);

  if (rpt.nss)
    for (let k=0, knt=rpt.nss.length;k<knt;++k) {
      console.log("NS %d: %s", k, rpt.nss[k]);
    }
  else
    console.log("NS (none)");

  if (rpt.soa) {
    console.log("SOA");
    for (let prop in rpt.soa) {
      console.log("    %s: %s", prop, rpt.soa[prop]);
    }
  } else
    console.log("SOA (none)");

   // propertyName is what you want
   // you can get the value like this: myObject[propertyName]

  if (rpt.lookups.length>0)
    for (let k=0, knt=rpt.lookups.length;k<knt;++k) {
      console.log("A%s %s: %s", rpt.lookups[k].family, rpt.lookups[k].dom, rpt.lookups[k].address);
      if (rpt.lookups.hostnames)
        for (let l=0, lnt=rpt.lookups.hostnames.length;l<lnt;++l)
          console.log(" ~ %s", rpt.lookups.hostnames[l]);
    }
  else
    console.log("A (none)");

  if (rpt.cnames)
    for (let k=0, knt=rpt.cnames.length;k<knt;++k) {
      console.log("CNAMES (%d) %s", k, rpt.cnames[k]);
    }
  else
    console.log("CNAMES (none)");

  if (rpt.txts)
    for (let k=0, knt=rpt.txts.length;k<knt;++k) {
      console.log("TXT (%d) %s", k, rpt.txts[k]);
    }
  else
    console.log("TXT (none)");

  if (rpt.txts)
    for (let k=0, knt=rpt.txts.length;k<knt;++k) {
      console.log("TXT (%d) %s", k, rpt.txts[k]);
    }
  else
    console.log("TXT (none)");

  if (rpt.mxs)
    for (let k=0, knt=rpt.mxs.length;k<knt;++k) {
      console.log("MX (%d) %s", k, JSON.stringify(rpt.mxs[k]));
    }
  else
    console.log("MX (none)");

  if (rpt.srvs)
    for (let k=0, knt=rpt.srvs.length;k<knt;++k) {
      console.log("SRV (%d) %s", k, JSON.stringify(rpt.srvs[k]));
    }
  else
    console.log("SRV (none)");

  for (let k=0, knt=rpt.servers.length;k<knt;++k) {
    console.log("Server %d: %s", k, rpt.servers[k]);
  }
});
