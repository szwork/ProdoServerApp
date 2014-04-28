// Importing 
var reds = require('../lib/reds'),
	// agent = require('superagent'),
	search = reds.createSearch('products');

var ProductModel = require("../../product/js/product-model");
var OrganizationModel = require("../../org/js/org-model");
var logger=require("../../common/js/logger");
var commonapi = require('../../common/js/common-api');
// var S=require("string");
exports.allProduct = function(req,res){
	var self=this;
	var letters = /^[A-Za-z0-9 *]+$/;
	var product_data = req.body;
	// console.log("######## product_data " + JSON.stringify(product_data));
	var product_name=product_data.name;
	var orgid = product_data.orgid;
	var product_name_or_arr=[];
	var query={status:{$in:["active","init"]}};
	
	if(product_name==undefined || product_name==""){
		res.send({"error":{"code":"AD001","message":"Please pass product name"}});
	}if(!product_name.match(letters)){
		res.send({"error":{"code":"AD001","message":"Please pass product name in alphabet or numbers only"}});
	}else if(orgid==undefined || orgid==""){
		res.send({"error":{"code":"AD001","message":"Please pass orgid"}});
	}else{
		if(product_name == "*"){
			query.orgid=orgid;
		}else{			
			product_name_or_arr.push(new RegExp('^'+product_name.substr(0,product_name.length), "i"));
			query.name={$in:product_name_or_arr};
			query.orgid=orgid;
			console.log("product_name_or_arr "+ product_name_or_arr);
		}		

		/***********SEARCH FROM PRODUCTS MODEL**********/
		var prod_name_arr = [];
		var doc_arr = [];
		ProductModel.find(query,{name:1,prodle:1,orgid:1,_id:0}).exec(function(err,doc){
			if(err){
				res.send({"error":{"code":"ED001","message":"Error in db to search product"}});
			}else if(doc.length==0){
				// var s = {"success":{"message":"No product exists","doc":doc},"name":{"message":"No product name exist","doc":""}};
				// res.send(s);
				_successfulGetAllProduct(self,doc_arr,prod_name_arr);
			}else{
				// var prod_name_arr = [];
				for(var i=0;i<doc.length;i++){
					doc_arr.push(doc[i]);
					prod_name_arr.push(doc[i].name);
				}
				//////////////////////////////////
				_successfulGetAllProduct(self,doc_arr,prod_name_arr);
				//////////////////////////////////
			}
		});
	}
	
	var _successfulGetAllProduct = function(self,doc,prod_name_arr){
		logger.emit("log","_successfulGetAllProduct");
		var s = {"success":{"message":"Getting Product details Successfully","doc":doc},"name":{"message":"Product Name","doc":prod_name_arr}};
		res.send(s);
	}
	
}


// exports._searchProduct = function(req,res){
// 	var productsearchdata = req.body.productsearchdata;
// 	console.log(JSON.stringify(productsearchdata));
// 	var self=this;
// 	// var query = {}
// 	var start = new Date;
// 	// var strs = [];
// 	ProductModel.find({},{name:1,prodle:1,orgid:1,_id:0}).exec(function(err,doc){
// 		if(err){
// 			res.send({"error":{"code":"ED001","message":"Error in db to search product"}});
// 		}else if(doc.length==0){
// 			res.send({"error":{"code":"ED001","message":"No product exists"}});
// 		}else{
// 			////////////////////////////////			
// 			_successfulGetAllProduct(self,doc);
// 			//////////////////////////////////
// 		}
			
// 			for(var i=0;i<doc.length;i++){
// 				strs.push(doc[i]);
// 			}
			
// 			/* Indexing */
// 			 indexing(strs);
			
// 			/* Searching */
// 			search.query(query = productsearchdata.name).end(function(err, ids){
// 			  if (err) throw err;
// 			  console.log("ids " + ids);
// 			  var result = ids.map(function(i){ return strs[i]; });			  
// 			  console.log('  Search results for "%s"', query);
// 			  result.forEach(function(str){
// 			    console.log('    - %s', str);
// 			    // res.send(str);
// 			  });
// 			  res.send(result);
// 			});
		
// 	});
	
// 	var _successfulGetAllProduct = function(self,doc){
// 		logger.emit("log","_successfulGetAllProduct");
// 		res.send({"success":{"message":"Getting Product details Successfully","doc":doc}});
// 	}


// 	function indexing(strs){
// 		var pending = strs.length;	
// 		strs.forEach(function(str, i){

// 			function log(msg) {
// 				console.log('  \033[90m%s \033[36m%s\033[0m', msg, str);
// 			}

// 			log('fetching');
// 			// agent.get(str, function(res){
// 				//var words;
// 				// strip html tags
// 				//log('stripping tags');
// 				//words = striptags(res.text);

// 				// index
// 				log('indexing');
// 				search.index(str, i, function(err){
// 				    if (err) throw err;
// 				    log('completed');
// 				    --pending || done();
// 				});
// 				// search.remove(i);				
// 			// });
// 		});
// 	}

// 	// all done
// 	function done() {
// 		console.log('  indexed %d pages in %ds', strs.length, ((new Date - start) / 1000).toFixed(2));
// 		//process.exit();
// 	}
// 	// lame, dont use me
// 	function striptags(html) {
// 		return String(html).replace(/<\/?([^>]+)>/g, '');
// 	}
// }
