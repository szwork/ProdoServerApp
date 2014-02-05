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

var orgapi = require("../org/js/org-api");
var userapi = require("../user/js/user-api");
var productapi=require("../product/js/product-api");
var productsearchapi = require("../productsearch/js/product-search-api");
var allproductsapi = require("../productsearch/js/all-product-api");
var emailtemplateapi = require("../common/js/email-template-api");
var subscriptionapi=require("../subscription/js/subscription-api");
var commonapi=require("../common/js/common-api");
var commentapi=require("../comment/js/comment-api");
var discountapi=require("../discount/js/discount-api");
var tagreffdictionary = require("../tagreffdictionary/js/tagreffdictionary-api");

exports.orgapi = orgapi;
exports.userapi = userapi;
exports.productapi = productapi;
exports.productsearchapi = productsearchapi;
exports.allproductsapi = allproductsapi;
exports.commentapi=commentapi;
exports.subscriptionapi=subscriptionapi;
exports.emailtemplateapi=emailtemplateapi;
exports.commonapi=commonapi;
exports.discountapi=discountapi;
exports.tagreffdictionary=tagreffdictionary;