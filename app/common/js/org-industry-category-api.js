var IndustryCatgory=require("./org-industry-category-model");
exports.loadindustrycategory=function(req,res){
	var orgindustrycategory=[ 
	  {
			categoryname:"automobile"
		},
		{
			categoryname:"telecom"
		},
		{
			categoryname:"advertising"
		},
		{
			categoryname:"hoteling"
		},
		{
			categoryname:"agriculture"
		},
		{
			categoryname:"aircraft"
		},
		{
			categoryname:"automotive"
		},
		{
			categoryname:"call centers"
		},
		{
			categoryname:"chemical"
		},
		{
			categoryname:"computer"
		},
		{
			categoryname:"cosmetics"
		},
		{
			categoryname:"defence"
		},{
			categoryname:"electronics"
		}
		,{
			categoryname:"energy"
		}
		,
		{
			categoryname:"financial services"
		},
		{
			categoryname:"grocery"
		},
		{
			categoryname:"health care"
		},
		{
			categoryname:"software"
		},
		{
			categoryname:"real estate"
		}
		]
		IndustryCatgory.create(orgindustrycategory,function(err,categories){
			if(err){
				req.send("Database Issue");
			}else{
				res.send("default industry category loaded")
			}
		})


	};
	// res.send("default email template loads");

