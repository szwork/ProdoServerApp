var FeatureAnalytics = require("./feature-analytics");
var logger = require("../../common/js/logger");

exports.getTagAnalyticsPieChart = function(req, res) {
	var sessionuserid = req.user.userid;
	var prodle = req.params.prodle;
	var featureanalytics = new FeatureAnalytics();

	featureanalytics.removeAllListeners("failedGetFeatureAnalytics");
  	featureanalytics.on("failedGetFeatureAnalytics",function(err){
    	logger.emit("error", err.error.message,req.user.userid);
    	res.send(err);
  	});

  	featureanalytics.removeAllListeners("successfulGetFeatureAnalytics");
	featureanalytics.on("successfulGetFeatureAnalytics",function(result){
    	logger.emit("info", result.success.message);      
		res.send(result);
	});
	featureanalytics.getTagAnalyticsPieChart(prodle);
}

exports.getTagAnalyticsForBarChart = function(req, res) {
	var sessionuserid = req.user.userid;
	var prodle = req.params.prodle;
	var featureanalytics = new FeatureAnalytics();

	featureanalytics.removeAllListeners("failedGetTagAnalyticsForBarChart");
  	featureanalytics.on("failedGetTagAnalyticsForBarChart",function(err){
    	logger.emit("error", err.error.message,req.user.userid);
    	res.send(err);
  	});

  	featureanalytics.removeAllListeners("successfulGetTagAnalyticsForBarChart");
	featureanalytics.on("successfulGetTagAnalyticsForBarChart",function(result){
    	logger.emit("info", result.success.message);      
		res.send(result);
	});
	featureanalytics.getTagAnalyticsForBarChart(prodle);
}

exports.getDatewiseTrendingForProduct = function(req, res) {
	var sessionuserid = req.user.userid;
	var prodle = req.params.prodle;
	var featureanalytics = new FeatureAnalytics();

	featureanalytics.removeAllListeners("failedGetDatewiseTrendingForProduct");
  	featureanalytics.on("failedGetDatewiseTrendingForProduct",function(err){
    	logger.emit("error", err.error.message,req.user.userid);
    	res.send(err);
  	});

  	featureanalytics.removeAllListeners("successfulGetDatewiseTrendingForProduct");
	featureanalytics.on("successfulGetDatewiseTrendingForProduct",function(result){
    	logger.emit("info", result.success.message);      
		res.send(result);
	});
	featureanalytics.getDatewiseTrendingForProduct(prodle);
}
