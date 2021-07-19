#!/usr/bin/env node

var express = require('express');
var http = require('http');
var app = express();
var path = require('path')
var bodyParser = require('body-parser');
var moment = require('moment');
var cors = require('cors');
const fs = require('fs');
var constaint = require('./src/config/constraint');
const cron = require("node-cron");
const fileUpload = require('express-fileupload');
require('dotenv').config({ path: __dirname + '/.env' });
const { routesPath } = require('./src/routes/index');

app.use(cors());
app.options('*', cors());

app.use(bodyParser.json({
    verify: (req, res, buf) => {
        req.rawBody = buf
    },
    limit: '50mb',
    extended: true
}));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));
app.use(fileUpload({
    useTempFiles: true,
    tempFileDir: '/tmp/',
    safeFileNames: true,
    preserveExtension: 4
}));

app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Headers", "Access-Control-Allow-Headers, Origin,Accept, X-Requested-With, Content-Type, Access-Control-Request-Method, Access-Control-Request-Headers");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    res.setHeader('Access-Control-Allow-Methods', 'GET,HEAD,OPTIONS,POST,PUT');
    //res.setHeader('Access-Control-Allow-Credentials', true);
    res.locals.base_url = req.protocol + '://' + req.get('host') + '/';
    //res.locals.file_upload_base_url = '/';
    next();
});


app.use(express.static('uploads'))
    //require('./src/routes/routing')(app);

var server = http.createServer({
    //key: fs.readFileSync('/etc/letsencrypt/live/www.dev.crmrunner.com/privkey.pem'),
    //cert: fs.readFileSync('/etc/letsencrypt/live/www.dev.crmrunner.com/fullchain.pem'),
    //ca: fs.readFileSync('/etc/letsencrypt/live/www.dev.crmrunner.com/chain.pem')
}, app);

// const io = require('socket.io')(server);
// require(__dirname + '/src/controllers/socket_config.js')(io);

server.listen(4400);

app.use(function(req, res, next) {
    //req.io = io;
    next();
});

//require('./src/routes/routing')(app);
app.use(routesPath);
app.use(function(req, res, next) {
    res.status(404).send("Sorry can't find that!");
});


