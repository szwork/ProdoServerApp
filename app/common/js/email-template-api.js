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
exports.loadEmailTemplate=function(req,res)
{
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
		},
		{
		templatetype: "invite",
		subject: "Invite from <companyname> for <grpname>",
		description: "Invite has sent by <companyname> to join Prodonus ,please click this link to add your details :<br> <url><br><br>Prodonus"
		}]


      EmailTemplateModel.create(emailtemplatedata,function(err,docs)
      {
        if(err)
        {
          console.log("error in inserting defaulte emailtemplate");
        }
        else
        {
          console.log("default emailtemplate saved");
          res.send({"success":"default emailtemplate saved"});
          //res.send({"success"})
        }
 
	  });
}

//first time
