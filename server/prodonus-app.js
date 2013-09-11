/**
 * Module dependencies.
 */

var express = require('express')
  , routes = require('./app/routes')
  , user = require('./app/routes/user')
  , http = require('http')
  , path = require('path');

var app = express();

 
// all environments
app.set('port', process.env.PORT || 3000);
// app.set('views', __dirname + '/app');
// app.set('view engine', 'jade');

// config
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(app.router);
// app.use(express.static(path.join(__dirname, 'public')));
app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

app.get('/', routes.index);
app.get('/users', user.list);

http.createServer(app).listen(app.get('port'), function(){
  console.log('Prodonus is ready to server on port ' + app.get('port'));
});
