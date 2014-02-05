var TagReffDicModel = require("./tagreffdictionary-model");
var events = require("events");
var logger=require("../../common/js/logger");

var TagReffDictionary = function(tagReffDicData) {
	this.tagreffdictionary = tagReffDicData;
};


TagReffDictionary.prototype = new events.EventEmitter;
module.exports = TagReffDictionary;

TagReffDictionary.prototype.addTag = function(sessionuserid,tagReffDicData){
	var self=this;
      ////////////////////////////////////
	_validateTagReffDicData(self,sessionuserid,tagReffDicData);
	//////////////////////////////////////	
}

var _validateTagReffDicData=function(self,sessionuserid,tagReffDicData) {
	if(tagReffDicData==undefined){
	   self.emit("failedAddTagReffDictionary",{"error":{"code":"AV001","message":"Please provide tagreffdicdata"}});	
	}else if(tagReffDicData.tagname==undefined){
		self.emit("failedAddTagReffDictionary",{"error":{"code":"AV001","message":"Please provide tagname to tagreffdicdata"}});		
	}else if(tagReffDicData.category==undefined){
		self.emit("failedAddTagReffDictionary",{"error":{"code":"AV001","message":"Please provide category to tagreffdicdata"}});		
	} else if(tagReffDicData.emotions==undefined){
		self.emit("failedAddTagReffDictionary",{"error":{"code":"AV001","message":"Please provide emotion to tagreffdicdata"}});			
	}else if(tagReffDicData.emotions.level==undefined){
		self.emit("failedAddTagReffDictionary",{"error":{"code":"AV001","message":"Please provide level to tagreffdicdata"}});			
	}else if(tagReffDicData.emotions.result==undefined){
		self.emit("failedAddTagReffDictionary",{"error":{"code":"AV001","message":"Please provide result to tagreffdicdata"}});			
	}else if(tagReffDicData.emotions.emotion_url==undefined){
		self.emit("failedAddTagReffDictionary",{"error":{"code":"AV001","message":"Please provide emotion_url to tagreffdicdata"}});			
	}else{
		///////////////////////////////////////////////////////
		_checkTagnameIsExist(self,sessionuserid,tagReffDicData)
		///////////////////////////////////////////////////////
	}
}

var _checkTagnameIsExist = function(self,sessionuserid,tagReffDicData){
	TagReffDicModel.findOne({tagname:tagReffDicData.tagname},{tagname:1},function(err,tagname){
		if(err){
			self.emit("failedAddTagReffDictionary",{"error":{"code":"ED001","message":"DB error:_addTag"+err}});	
		}else if(tagname){
			self.emit("failedAddTagReffDictionary",{"error":{"message":"Tagname already exists"}});	
		}else{
			///////////////////////////////////
			_addTag(self,tagReffDicData);
			//////////////////////////////////
		}
	})
}

var _addTag = function(self,tagReffDicData){
	var tagreffdic_data = new TagReffDicModel(tagReffDicData);	
	tagreffdic_data.save(function(err,tag_data){
		if(err){
			self.emit("failedAddTagReffDictionary",{"error":{"code":"ED001","message":"Error in db to save new tag"}});
		}else{      
  			///////////////////////////////////
			_successfulAddTagReffDictionary(self,tag_data);
			/////////////////////////////////				
		}
	})
}

var _successfulAddTagReffDictionary=function(self,newtag_data){
	logger.emit("log","successfulAddTagReffDictionary");
	self.emit("successfulAddTagReffDictionary",{"success":{"message":"Tag added sucessfully in refference dictionary","tag_data":newtag_data}})
}

TagReffDictionary.prototype.getAllTag = function() {
	var self=this;
	//////////////////
	_getAllTag(self);
	///////////////////
};
var _getAllTag=function(self){
	TagReffDicModel.find({}).lean().exec(function(err,tags){
		if(err){
			self.emit("failedGetAllTagReffDictionary",{"error":{"code":"ED001","message":"Error in db to find all users"}});
		}else if(tags.length==0){
			self.emit("failedGetAllTagReffDictionary",{"error":{"code":"AU003","message":"No tag exist"}});
		}else{
			////////////////////////////////
			_successfulUserGetAll(self,tags);
			//////////////////////////////////
		}
	})
};

var _successfulUserGetAll=function(self,tags){
	logger.emit("log","_successfulGetAllTagReffDictionary");
	self.emit("successfulGetAllTagReffDictionary", {"success":{"message":"Getting Tag details Successfully","tags":tags}});
}

