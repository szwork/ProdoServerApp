/**
 * Prodonus App
 * A warranty and social network platform for products. It enables conversation between
 * the manufacturers and consumers, both individuals and companies
 *  
 */

var express = require('express')
	 , routes = require('./routes')
	 , Log = require('log')
     , api = require('./routes/api')
     , envir = require('./config/environment')
     , mongoose = require('mongoose')
     , fs = require('fs')
     , path = require('path');

/*All the routes files are described and stored in the routes directory
* All the routes for prodonus are initialized in the code below. The init function
* is called on all the routes.
*/
var RouteDir = 'routes',
    files = fs.readdirSync(RouteDir);

files.forEach(function (file) {
    var filePath = path.resolve('./', RouteDir, file),
        route = require(filePath);
    route.init(app);
});

var app = express();
var log = new Log();

mongoose.connect('mongodb://localhost/contacts_database');

// defines app settings with default values for Prodonus
app.set('log level', process.env.PRODONUS_LOG_LEVEL || Log.DEBUG);
app.set('session secret', process.env.PRODONUS_SESSION_SECRET || 'secret');
app.set('session age', process.env.PRODONUS_SESSION_AGE || 3600);
app.set('port', process.env.PRODONUS_PORT || 9000);

// configures default logger available for middleware and requests
app.use(function (req, res, next) {
    req.log = new Log(app.get('log level'));
    next();
});

// logs all requests if log level is INFO or higher using log module format
if (app.get('log level') >= Log.INFO) {
    var format = '[:date] INFO :remote-addr - :method :url ' +
                 ':status :res[content-length] - :response-time ms';
    express.logger.token('date', function () { return new Date(); });
    app.use(express.logger(format));
}

app.use(express.favicon());
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(app.router);
app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));

// enables compression for all requests
app.use(express.compress());

//Set the Prodonus Server
http.createServer(app).listen(app.get('port'), function(){
  console.log('Prodonus is ready to server on port ' + app.get('port'));
});
