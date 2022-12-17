// imports
// file system stuff
require("dotenv").config();
const fs = require("fs");

// webserver
const express = require("express");
const app = express();
const http = require('http').Server(app);
// https
const privateKey = fs.readFileSync('/etc/letsencrypt/live/french.invaderj.rocks/privkey.pem', 'utf8');
const certificate = fs.readFileSync('/etc/letsencrypt/live/french.invaderj.rocks/cert.pem', 'utf8');
const ca = fs.readFileSync('/etc/letsencrypt/live/french.invaderj.rocks/chain.pem', 'utf8');
const credentials = {
	key: privateKey,
	cert: certificate,
	ca: ca
};
const https = require('https').Server(credentials, app);

// git
const simpleGit = require("simple-git");
const git = simpleGit.default();


// server listen
http.listen(80, () => {
  console.log("Listening on port 80");
});

https.listen(443, () => {
    console.log("Listening on port 443");
});

// routes
app.use(function (req, res, next) {
    console.log("[" + new Date().toLocaleString() + "] [app.use] Route: " + req.url + " | IP: " + req.ip + " | Forwarded-For: " + req.headers["x-forwarded-for"]);
    next();
});

app.get("/", (req, res) => {
    res.sendFile(process.cwd() + "/index.html")
});
app.get("/higher", (req, res) => {
    res.sendFile(process.cwd() + "/higher.html")
});
app.get("/favicon.ico", (req, res) => {
    res.sendFile(process.cwd() + "/france.ico");
});

app.use('/fonts', express.static('fonts'));
app.use('/js', express.static('js'));
app.get("/phrases", express.static('phrases'));

app.get("/patch", async (req, res) => {
    if (req.query.token == process.env.TOKEN) {
        res.send("Updating from Git now.");
        console.log("Running git pull now.");
        await git.pull(["origin", "main"]);
        let hash = await git.revparse(["HEAD"]);
        console.log("Now up-to-date with " + hash.slice(0, 7));

        let string = "Last restart: " + new Date().toLocaleString(); 
        fs.writeFile("restart.mistbot", string, function() {return;});
    }
    else {
        res.status(401).send("Goodbye.");
    }
});