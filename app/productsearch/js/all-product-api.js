// Importing 
var reds = require('../lib/reds'),
	// agent = require('superagent'),
	search = reds.createSearch('products');

var ProductModel = require("../../product/js/product-model");
var logger=require("../../common/js/logger");
var S=require("string");
exports.allProduct = function(req,res){
	
	var query = {}
	var start = new Date;
	var strs = [];
	ProductModel.find(query,{name:1,prodle:1,orgid:1,_id:0}).exec(function(err,doc){
		if(err){
			self.emit("failedToSearchProduct",{"error":{"code":"ED001","message":"Error in db to search product"}});
		}else{
			
			for(var i=0;i<doc.length;i++){
				strs.push(JSON.stringify(doc[i]));
			}
			
			// Indexing
			indexing(strs);
			
			/* SEARCH */
			// search.query(query = 'LG').end(function(err, ids){
			//   if (err) throw err;
			//   console.log("ids " + ids);
			//   var result = ids.map(function(i){ return strs[i]; });
			//   // console.log(result);
			//   console.log('  Search results for "%s"', query);
			//   result.forEach(function(str){
			//     console.log('    - %s', str);
			//     res.send(str);
			//   });
			// });
		}
	});


	function indexing(strs){
		var pending = strs.length;
				
		strs.forEach(function(str, i){

			function log(msg) {
				console.log('  \033[90m%s \033[36m%s\033[0m', msg, str);
			}

			log('fetching');
			//agent.get(str, function(res){
				var words;

				 // strip html tags
				log('stripping tags');
				words = striptags(res.text);

				// index
				log('indexing');
				search.index(str, i, function(err){
				    if (err) throw err;
				    log('completed');
				    --pending || done();
				});
			//});
		});
	}

	// all done
	function done() {
		console.log('  indexed %d pages in %ds', strs.length, ((new Date - start) / 1000).toFixed(2));
		//process.exit();
	}
	// lame, dont use me
	function striptags(html) {
		return String(html).replace(/<\/?([^>]+)>/g, '');
	}
	module.exports.strs = strs;
}