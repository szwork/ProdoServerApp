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

  	tagreffdictionary.removeAllListeners("successfulAddTagReffDictionary");
	tagreffdictionary.on("successfulAddTagReffDictionary",function(result){
    	logger.emit("info", result.success.message);
		res.send(result);
	});
	console.log("asfseafgsdgg : "+JSON.stringify(req.user.userid));
	if(req.user.isAdmin==true){
		tagreffdictionary.addTag(sessionuserid,tagReffDicData);
	}else{
		tagreffdictionary.emit("failedAddTagReffDictionary",{"error":{"message":"You are not authorized to add tag"}});
	}
    
}

exports.getAllTag = function(req, res) {
	var sessionuserid = req.user.userid;	
	var tagreffdictionary = new TagReffDictionary();

	tagreffdictionary.removeAllListeners("failedGetAllTagReffDictionary");
  	tagreffdictionary.on("failedGetAllTagReffDictionary",function(err){
    	logger.emit("error", err.error.message,req.user.userid);
    	res.send(err);
  	});

  	tagreffdictionary.removeAllListeners("successfulGetAllTagReffDictionary");
	tagreffdictionary.on("successfulGetAllTagReffDictionary",function(result){
    	logger.emit("info", result.success.message);      
		res.send(result);
	});
	tagreffdictionary.getAllTag();
}

exports.getAllDomainTags = function(req, res) {
	var sessionuserid = req.user.userid;	
	var tagreffdictionary = new TagReffDictionary();

	tagreffdictionary.removeAllListeners("failedGetAllDomainTag");
  	tagreffdictionary.on("failedGetAllDomainTag",function(err){
    	logger.emit("error", err.error.message,req.user.userid);
    	res.send(err);
  	});

  	tagreffdictionary.removeAllListeners("successfulGetAllDomainTag");
	tagreffdictionary.on("successfulGetAllDomainTag",function(result){
    	logger.emit("info", result.success.message);      
		res.send(result);
	});
	tagreffdictionary.getAllDomainTags();
}