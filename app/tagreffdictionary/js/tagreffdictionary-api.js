var TagReffDictionary = require("./tagreffdictionary");
var logger = require("../../common/js/logger");


exports.addTag = function(req, res) {
	var sessionuserid = req.user.userid;
	var tagReffDicData = req.body.tagreffdicdata;
	var tagreffdictionary = new TagReffDictionary();

	tagreffdictionary.removeAllListeners("failedAddTagReffDictionary");
  		tagreffdictionary.on("failedAddTagReffDictionary",function(err){
    	logger.emit("error", err.error.message,req.user.userid);
    	res.send(err);
  	});

	tagreffdictionary.on("successfulAddTagReffDictionary",function(result){
    	logger.emit("info", result.success.message);      
		res.send(result);
	});
    tagreffdictionary.addTag(sessionuserid,tagReffDicData);    
}

exports.getAllTag = function(req, res) {
	var sessionuserid = req.user.userid;	
	var tagreffdictionary = new TagReffDictionary();

	tagreffdictionary.removeAllListeners("failedGetAllTagReffDictionary");
  		tagreffdictionary.on("failedGetAllTagReffDictionary",function(err){
    	logger.emit("error", err.error.message,req.user.userid);
    	res.send(err);
  	});

	tagreffdictionary.on("successfulGetAllTagReffDictionary",function(result){
    	logger.emit("info", result.success.message);      
		res.send(result);
	});
    tagreffdictionary.getAllTag();
}