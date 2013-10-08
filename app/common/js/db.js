
/*
* Overview: Mongodb Database connections
* Dated:
* Author: Sunil More
* Copyright: Prodonus Software Private Limited and GiantLeap Systems Private Limited 2013
* Change History:
* ----------------------------------------------------------------------
* date | author | description 
* ----------------------------------------------------------------------
* 27-3-2013 | xyx | Add a new property
* 
*/

 var mongodb = require('mongodb');
 var mongoose = require('mongoose');

mongoose.connect('localhost', 'prd-dev2');

var db = mongoose.connection;

db.on('error', console.error.bind(console, 'connection error: Cannot connect to prd-dev'));
db.once('open', function callback() {
  console.log('Connected to prd-dev');
});

module.exports = mongoose;
