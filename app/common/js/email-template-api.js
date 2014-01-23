var EmailTemplateModel=require('./email-template-model');

exports.getAllEmailTemplate=function(req,res){
	EmailTemplateModel.find({},{_id:0,__v:0},function(err,emailtemplate){
		if(err){
			logger.error("error in gettin email templates");
		}
		else{
			res.send(emailtemplate);
		}
	})
};
exports.loadEmailTemplate=function(req,res){
	var emailtemplatedata=[ {
			templatetype: "password",
			subject: "Password reset request for Prodonus",
			description: "Please click or copy this link into new browser to change your password on Prodonus:<br><br><url><br><br>Regards,<br>Prodonus"
		},
		{
			templatetype: "verify",
			subject: "Prodonus Verification Link",
			description: "Hey, we want to verify that you are indeed <email> If t that/s the case, please follow the link below:<br><br><url><br><br> If you're not <email> didn't request verification you can ignore this email."
		},
		{
			templatetype: "welcome",
			subject: "Welcome To Prodonus",
			description: "Hi <username>,<br> Welcome to Prodonus! You’ve just joined a community of product manufacturers and users who are sharing their insights on products. At Prodonus, we strive to bring business closer to their customers to enable conversation , in addition to managing their warranties.<br>Talk to manufacturers, interact with consumers from around the world, and explore tons of interesting questions and insights. We are committed to bring all the manufacturers available to everyone.<br>Eager to start? Start following the products that interests you, and there’s no limit to the number of products you can follow.<br>We are thrilled that you have joined us! Congratulations! Leave comments and suggestions, and share your story!<br>During your free trial period, you will be able to use prodonus as you would like, of any number of products. At the end of the free trial period, you will be asked to select a plan according to the user type - individuals, companies, manfacturer's.<br<Cheers,<br>Prodonus Team<br><br>You are receiving this email because <email> is subscribed to Prodonus. Please do not reply directly to noreply@prodonus.com. If you have any questions or feedback, please visit our support link or write to support@prodonus.com"
		},
		{
			templatetype: "welcomeinvite",
			subject: "Your Password details",
			description: "Hi <username>,<br> Welcome to Prodonus! <orgname> Your One Time Password:<password>You’ve just joined a community of product manufacturers and users who are sharing their insights on products. At Prodonus, we strive to bring business closer to their customers to enable conversation , in addition to managing their warranties.<br>Talk to manufacturers, interact with consumers from around the world, and explore tons of interesting questions and insights. We are committed to bring all the manufacturers available to everyone.<br>Eager to start? Start following the products that interests you, and there’s no limit to the number of products you can follow.<br>We are thrilled that you have joined us! Congratulations! Leave comments and suggestions, and share your story!<br>During your free trial period, you will be able to use prodonus as you would like, of any number of products. At the end of the free trial period, you will be asked to select a plan according to the user type - individuals, companies, manfacturer's.<br<Cheers,<br>Prodonus Team<br><br>You are receiving this email because <email> is subscribed to Prodonus. Please do not reply directly to noreply@prodonus.com. If you have any questions or feedback, please visit our support link or write to support@prodonus.com"
		},
		{
			templatetype: "orgmemberinvite",
			subject: "Invite from <companyname> for <grpname>",
			description: "Invite has sent by <companyname> to join Prodonus ,please click this link to add your details :<br> <url><br><br>Prodonus"
		},
		{
			templatetype: "userinvite",
			subject: "Invite From Prodonus ",
			description: "Invite has sent by <username> to join Prodonus ,please click this link to add your details www.prodonus.com"
		},
		{
			templatetype: "orgcustomerinvite",
			subject: "Invite From Prodonus ",
			description: "Invite has sent by <username> to join Prodonus ,please click this link to add your details www.prodonus.com"
		},
		{
			templatetype: "otherorginvite",
			subject: "Invite From Prodonus ",
			description: "Invite has sent by <username> to join Prodonus ,please click this link to add your details www.prodonus.com"
		}]


      EmailTemplateModel.create(emailtemplatedata,function(err,docs){
        if(err){
          console.log("error in inserting defaulte emailtemplate");
        }
        else{
          console.log("default emailtemplate saved");
          res.send({"success":"default emailtemplate saved"});
          //res.send({"success"})
        }
 
	  });
}


//first time
