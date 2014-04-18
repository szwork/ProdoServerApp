var TagReffDicModel = require("./tagreffdictionary-model");
var events = require("events");
var logger=require("../../common/js/logger");

var TagReffDictionary = function(tagReffDicData) {
	this.tagreffdictionary = tagReffDicData;
};

TagReffDictionary.prototype = new events.EventEmitter;
module.exports = TagReffDictionary;

TagReffDictionary.prototype.addTag = function(sessionuserid,tagReffDicData){
	var self = this;
      ////////////////////////////////////
	_validateTagReffDicData(self,sessionuserid,tagReffDicData);
	//////////////////////////////////////	
}

var _validateTagReffDicData = function(self,sessionuserid,tagReffDicData) {
	if(tagReffDicData==undefined){
	   self.emit("failedAddTagReffDictionary",{"error":{"code":"AV001","message":"Please provide tagreffdicdata"}});	
	}else if(tagReffDicData.tagname==undefined || tagReffDicData.tagname.trim()==""){
		self.emit("failedAddTagReffDictionary",{"error":{"code":"AV001","message":"Please provide tagname to tagreffdicdata"}});		
	}else if(tagReffDicData.emotions.category==undefined){
		self.emit("failedAddTagReffDictionary",{"error":{"code":"AV001","message":"Please provide category to tagreffdicdata"}});		
	} else if(tagReffDicData.emotions==undefined){
		self.emit("failedAddTagReffDictionary",{"error":{"code":"AV001","message":"Please provide emotion to tagreffdicdata"}});			
	}else if(tagReffDicData.emotions.level==undefined){
		self.emit("failedAddTagReffDictionary",{"error":{"code":"AV001","message":"Please provide level to tagreffdicdata"}});			
	}else if(tagReffDicData.emotions.result==undefined){
		self.emit("failedAddTagReffDictionary",{"error":{"code":"AV001","message":"Please provide result to tagreffdicdata"}});			
	}else if(tagReffDicData.domain_tag==undefined){
		self.emit("failedAddTagReffDictionary",{"error":{"code":"AV001","message":"Please provide domain tag to tagreffdicdata"}});			
	}else{
		///////////////////////////////////////////////////////
		_checkTagnameIsExist(self,sessionuserid,tagReffDicData);
		///////////////////////////////////////////////////////
	}
}

var _checkTagnameIsExist = function(self,sessionuserid,tagReffDicData){
	TagReffDicModel.findOne({tagname:tagReffDicData.tagname.trim().toLowerCase()},{tagname:1},function(err,tagname){
		if(err){
			self.emit("failedAddTagReffDictionary",{"error":{"code":"ED001","message":"DB error:_addTag"+err}});	
		}else if(tagname){
			self.emit("failedAddTagReffDictionary",{"error":{"code":"ED001","message":"Tag name already exists"}});	
		}else{
			///////////////////////////////////
			_addTag(self,tagReffDicData);
			//////////////////////////////////
		}
	})
}

var _addTag = function(self,tagReffDicData){
	var tagreffdic_data = new TagReffDicModel(tagReffDicData);
	tagreffdic_data.tagname = tagReffDicData.tagname.trim().toLowerCase();
	tagreffdic_data.save(function(err,tag_data){
		if(err){
			self.emit("failedAddTagReffDictionary",{"error":{"code":"ED001","message":"Error in db to save new tag"}});
		}else{
  			/////////////////////////////////
			_successfulAddTagReffDictionary(self);
			/////////////////////////////////
		}
	})
}

var _successfulAddTagReffDictionary = function(self){
	logger.emit("log","successfulAddTagReffDictionary");
	self.emit("successfulAddTagReffDictionary",{"success":{"message":"Tag added sucessfully in refference dictionary"}})
}

TagReffDictionary.prototype.getAllTag = function() {
	var self = this;
	//////////////////
	_getAllTag(self);
	///////////////////
};
var _getAllTag = function(self){
	TagReffDicModel.find({}).lean().exec(function(err,tags){
		if(err){
			self.emit("failedGetAllTagReffDictionary",{"error":{"code":"ED001","message":"Error in db to find all users"}});
		}else if(tags.length == 0){
			self.emit("failedGetAllTagReffDictionary",{"error":{"code":"AU003","message":"No tag exist"}});
		}else{
			////////////////////////////////
			_successfulGetAllTag(self,tags);
			////////////////////////////////
		}
	})
};

var _successfulGetAllTag = function(self,tags){
	logger.emit("log","_successfulGetAllTagReffDictionary");
	self.emit("successfulGetAllTagReffDictionary", {"success":{"message":"Getting All tag details Successfully","tags":tags}});
}

TagReffDictionary.prototype.getAllDomainTags = function() {
	var self = this;
	//////////////////
	_getAllDomainTags(self);
	///////////////////
};
var _getAllDomainTags = function(self){
	TagReffDicModel.aggregate([{"$unwind":"$domain_tag"},{$group:{_id:null,tags:{"$addToSet":"$domain_tag"}}}]).exec(function(err,tags){
		if(err){
			self.emit("failedGetAllDomainTag",{"error":{"code":"ED001","message":"Error in db to find all users"}});
		}else if(tags.length == 0){
			self.emit("failedGetAllDomainTag",{"error":{"code":"AU003","message":"No Domain tag exist"}});
		}else{
			////////////////////////////////
			_successfulGetAllDomainTags(self,tags[0]);
			////////////////////////////////
		}
	})
};

var _successfulGetAllDomainTags = function(self,tags){
	logger.emit("log","_successfulGetAllDomainTags");
	self.emit("successfulGetAllDomainTag", {"success":{"message":"Getting All Domain Tag Details Successfully","domain_tags":tags}});
}