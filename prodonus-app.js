/*
* Overview: Prodonus App
* A warranty and social network platform for products. It enables conversation between
* the manufacturers and consumers, both individuals and companies
* Dated:
* Author: Sunil More
* Copyright: Prodonus Software Private Limited and GiantLeap Systems Private Limited 2013
* Change History:
* ----------------------------------------------------------------------
* date | author | description 
* ----------------------------------------------------------------------
* 27-3/2013 | xyx | Add a new property
* 
*/

var express = require('express');
// var	routes = require('./routes');
// var Log = require('log');
// var api = require('./routes/api');
// var envir = require('./config/environment');
// var mongoose = require('mongoose');
var http = require('http');
var fs = require('fs');
var passport=require('passport');
var path = require('path');
var api=require("./app/api/api");

var app = express();
app.use(express.favicon());
app.use(express.logger());
app.use(express.cookieParser());
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(express.session({ secret: 'keyboard cat' }));
// Initialize Passport!  Also use passport.session() middleware, to support
// persistent login sessions (recommended).
app.use(passport.initialize());
app.use(passport.session());
app.use(app.router);
app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));

// enables compression for all requests
app.use(express.compress());

/*All the routes files are described and stored in the routes directory
* All the routes for prodonus are initialized in the code below. The init function
* is called on all the routes.
*/var server=http.createServer(app);
var io = require('socket.io').listen(server);
var RouteDir = './app/routes',
    files = fs.readdirSync(RouteDir);

files.forEach(function (file) {
    var filePath = path.resolve('./', RouteDir, file),
        route = require(filePath);
    route.init(app);
});

app.get("/api",function(req,res){
	res.send("Welcome to Prodonus");
})
// var log = new Log();
io.sockets.on('connection', function(socket) {
    socket.on('addComment', function(prodle,commentdata) {
     api.productapi.addCommentBySocket(prodle,commentdata,function(err,result){
        var userid=app.get("userid");

     	if(err){
     		socket.emit("commentResponse",err,null);
     	}else{

     		socket.emit("commentResponse",result,{name:"Sunil More",address:"Karve Nagar"});
     	}
     	
     })  
        //socket.emit("send-file","");
  });
})
// // defines app settings with default values for Prodonus
// app.set('log level', process.env.PRODONUS_LOG_LEVEL || Log.DEBUG);
// app.set('session secret', process.env.PRODONUS_SESSION_SECRET || 'secret');
// app.set('session age', process.env.PRODONUS_SESSION_AGE || 3600);
app.set('port', process.env.PRODONUS_PORT || 8000);


// // configures default logger available for middleware and requests
// app.use(function (req, res, next) {
//     req.log = new Log(app.get('log level'));
//     next();
// });

// // logs all requests if log level is INFO or higher using log module format
// if (app.get('log level') >= Log.INFO) {
//     var format = '[:date] INFO :remote-addr - :method :url ' +
//                  ':status :res[content-length] - :response-time ms';
//     express.logger.token('date', function () { return new Date(); });
//     app.use(express.logger(format));
// }

//module.exports = app;
//Set the Prodonus Server
global.userid = "";
server.listen(app.get('port'), function(){
  console.log('Prodonus is ready to server on port ' + app.get('port'));
});
