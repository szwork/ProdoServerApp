// Importing 
var reds = require('../lib/reds'),
	// agent = require('superagent'),
	search = reds.createSearch('products');

var ProductModel = require("../../product/js/product-model");
var logger=require("../../common/js/logger");
// var S=require("string");
exports.allProduct = function(req,res){
	// var productsearchdata = req.body.productsearchdata;
	// console.log(JSON.stringify(productsearchdata));

	// var query = {}
	var start = new Date;
	var strs = [];
	ProductModel.find({},{name:1,prodle:1,orgid:1,_id:0}).exec(function(err,doc){
		if(err){
			self.emit("failedToSearchProduct",{"error":{"code":"ED001","message":"Error in db to search product"}});
		}else{
			
			for(var i=0;i<doc.length;i++){
				strs.push(doc[i]);
			}
			
			/* Indexing */
			 // indexing(strs);
			
			/* Searching */
			// search.query(query = productsearchdata.name).end(function(err, ids){
			//   if (err) throw err;
			//   console.log("ids " + ids);
			//   var result = ids.map(function(i){ return strs[i]; });			  
			//   console.log('  Search results for "%s"', query);
			//   result.forEach(function(str){
			//     console.log('    - %s', str);
			//     // res.send(str);
			//   });
			  // res.send(result);
			// });
		}
		res.send(strs);
	});


	function indexing(strs){
		var pending = strs.length;	
		strs.forEach(function(str, i){

			function log(msg) {
				console.log('  \033[90m%s \033[36m%s\033[0m', msg, str);
			}

			log('fetching');
			// agent.get(str, function(res){
				//var words;
				// strip html tags
				//log('stripping tags');
				//words = striptags(res.text);

				// index
				log('indexing');
				search.index(str, i, function(err){
				    if (err) throw err;
				    log('completed');
				    --pending || done();
				});
				// search.remove(i);				
			// });
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
}