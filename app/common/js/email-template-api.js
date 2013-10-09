var EmailTemplateModel=require('./email-template-model');

exports.getAllEmailTemplate=function(req,res)
{
	EmailTemplateModel.find({},{_id:0,__v:0},function(err,emailtemplate)
	{
		if(err)
		{
			console.log("error in gettin email templates");
		}
		else
		{
			res.send(emailtemplate);
		}
	})
};

//first time
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
subject: "Welocme to Prodonus",
description: "Welocme <fullname> to Prodonus"
}]

EmailTemplateModel.find(function(err,emailtemplate)
{
   if(err)
   {
   	console.log("error in finding emailtemplate at adding manually ")
   }
   if(emailtemplate.length<0)
   {
    
   }

})