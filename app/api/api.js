/*
* Overview: Organization Model
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

var orgapi = require("../org/registration/js/org-api");
var userapi = require("../user/registration/js/user-api");
var emailtemplateapi = require("../common/js/email-template-api");
var subscriptionapi=require("../subscription/subscription-api");
var commonapi=require("../common/js/common-api");

exports.orgapi = orgapi;
exports.userapi = userapi;
//exports.commonapi=commonapi;
exports.subscriptionapi=subscriptionapi;
exports.emailtemplateapi=emailtemplateapi;
exports.commonapi=commonapi;