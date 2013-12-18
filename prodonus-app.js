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
var logger=require("./app/common/js/logger");

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
var api =require("./app/api/api");
//var SessionSockets = require('session.socket.io');
var connect = require('connect');
 var passportSocketIo = require("passport.socketio");
var app = express();
var redis = require("redis").createClient();
var RedisStore = require('connect-redis')(express);

var redisstore =new RedisStore({ host: 'localhost', port: 5000, client: redis });
// app.use(function(req, res, next) {
  
//   res.on('header', function() {
//     console.trace('HEADERS GOING TO BE WRITTEN');
//   });
//   next();
// });
app.use(express.favicon());
app.use(express.logger());
app.use(express.cookieParser());
// app.use(express.bodyParser());
app.use(express.json());
app.use(express.urlencoded());
app.use(express.methodOverride());

app.use(express.session({secret:"qwerty1234",store: redisstore,key:"express.sid"}));
// Initialize Passport!  Also use passport.session() middleware, to support
// persistent login sessions (recommended).
app.use(passport.initialize());
app.use(passport.session());
app.use(app.router);
app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
app.use(function(req, res, next) {
  console.log("app use headers");
  req.headers['if-none-match'] = 'no-match-for-this';
  next();  
});

/////to disable no cache always give 200 statuscode for eache request
app.disable('etag');
//////

  
/////
// enables compression for all requests
app.use(express.compress());

/*All the routes files are described and stored in the routes directory
* All the routes for prodonus are initialized in the code below. The init function
* is called on all the routes.
*/var server=http.createServer(app);

////////////socket i.o/////////////
var io = require('socket.io').listen(server);

io.set('authorization', passportSocketIo.authorize({
  cookieParser: express.cookieParser,
  key:         'express.sid',       // the name of the cookie where express/connect stores its session_id
  secret:      "qwerty1234",    // the session_secret to parse the cookie
  store:       redisstore,        // we NEED to use a sessionstore. no memorystore please
  success:     onAuthorizeSuccess,  // *optional* callback on success - read more below
  fail:        onAuthorizeFail,     // *optional* callback on fail/error - read more below
}));
//io.set( 'origins', '' );

function onAuthorizeSuccess(data, accept){
  console.log('successful connection to socket.io');

  // The accept-callback still allows us to decide whether to
  // accept the connection or not.
  accept(null, true);
}

function onAuthorizeFail(data, message, error, accept){
  if(error)
    console.log("redis server not  stared");
    console.log('failed connection to socket.io:', message);

  // We use this callback to log all of our failed connections.
  accept(null, false);
}
////////////////////////////////////////
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
// io.on('connection', function(socket) {
//     var sessionuserid=socket.handshake.user.userid;
//     // console.log("passport sessiond"+socket.handshake.sessionID);
//     // console.log("sessionuserid"+sessionuserid)
//     socket.on('addComment', function(prodle,commentdata) {
//        logger.emit("log","calling to addcoment server socket by"+sessionuserid);
//        api.commentapi.addCommentBySocket(sessionuserid,prodle,commentdata,function(err,result){
//        if(err){
//           socket.emit("addcommentResponse",err,null);
//       	}else{
//           socket.emit("addcommentResponse",null,{"success":{"message":"Comment Added Successfully"}});
//            if(commentdata.type=="product"){
//             socket.broadcast.emit("productcommentResponse",null,result);
//            }else{
//             socket.broadcast.emit("warrantycommentResponse",null,result);
//            }
//      		}
//         socket.removeListener('addComment',function(stream){
//           console.log("addcoment removed");  
//         });
//       	})  
//         //socket.emit("send-file","");
//   });
//   socket.on('uploadFiles', function(file,action) {
//     ///action for user profile update
//      //action:{user:{userid:}}
//      //action for org images upload
//      //action:{org:{userid:,orgid:}}
//      //action for product images upload
//      //action:{product:{userid:,orgid:,prodle:}}
      
//     console.log("calling to Upload files");
//     ///////////////
//     api.commonapi.uploadFiles(file,__dirname,action,function(err,url){
//       if(err){
//         console.log("error in uploadFiles"+err);
//       }else{
//         socket.emit("uploadFileResponse",url);
//       }
//     })
//   })
// })


// // defines app settings with default values for Prodonus
// app.set('log level', process.env.PRODONUS_LOG_LEVEL || Log.DEBUG);
// app.set('session secret', process.env.PRODONUS_SESSION_SECRET || 'secret');
// app.set('session age', process.env.PRODONUS_SESSION_AGE || 3600);
app.set('port', process.env.PRODONUS_PORT || 8000);

api.commentapi.init(io);

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
// global.userid = "";
server.listen(app.get('port'), function(){
  console.log('Prodonus is ready to server on port ' + app.get('port'));
});
