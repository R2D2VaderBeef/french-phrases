// imports
// file system stuff
require("dotenv").config();
const fs = require("fs");

// webserver
const express = require("express");
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);

// git
const simpleGit = require("simple-git");
const git = simpleGit.default();


// server code
http.listen(3000, () => {
  console.log("Listening on port 3000");
});

app.use(function (req, res, next) {
    console.log("[" + new Date().toLocaleString() + "] [app.use] Route: " + req.url + " | IP: " + req.ip + " | Forwarded-For: " + req.headers["x-forwarded-for"]);
    next();
});

app.get("/", (req, res) => {
    res.sendFile(process.cwd() + "/index.html")
});

app.get("/favicon.ico", (req, res) => {
    res.sendFile(process.cwd() + "/france.ico");
});

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
})