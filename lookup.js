"use strict";

var dns = require('./js/dns.js');

var express  = require("express"),
  morgan     = require("morgan"),
  bodyParser = require("body-parser"),
  app        = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(morgan("dev"));

console.log("- Serving: localhost:%s\n", process.env.PORT || 3000);

app.get("/dns/*", (req, res) => {
  var prts = req.path.slice(5).split(",");
//var rqst = req.path.slice(5);
//var prts = rqst.split(",");

  if (!prts.length)
    res.status(404).send("an interesting query...");
  else {
    var host = prts[0];
    var subs = (prts.length>1)? prts.slice(1):[];
    var msgQ = [];

    var say = (key, val) => {
      msgQ.push(key + ": " + host);
      console.log("%s: %s", key, val);
    }

    res.status(404);

    say("Host", host);
    if (prts.length > 1)
      say("subs", subs.join(", "));

    dns.lookup(host, subs)
    .then ((rpt) => {
      res.status(200).send(JSON.stringify(rpt));
    })
    .catch((err) => {
      res.status(403).send("whoops: " + err);
    });
  }
});

app.listen(process.env.PORT || 3000);
module.exports = app;
