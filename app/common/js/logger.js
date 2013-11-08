/*
* Overview:Logger 
* Dated:
* Author: Sunil More
* Copyright: Prodonus Software Private Limited and GiantLeap Systems Private Limited 2013
* Change History:
* ----------------------------------------------------------------------
* date | author | description 
* ----------------------------------------------------------------------
* export logger object
* 
*/
 
var MongoDB = require('winston-mongodb').MongoDB;
var winston = require('winston');
var CONFIG=require("config").Prodonus;
var logger = new (winston.Logger)({
transports: [
    new (winston.transports.Console)(),
    new (winston.transports.MongoDB)({ host: CONFIG.dbHost,  db: CONFIG.dbName, collection: 'log'})
], exceptionHandlers: [ new winston.transports.Console() ]
});

module.exports=logger