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
			description: "Forgot your password <username>, Prodonus received a request to reset password for your Prodonus account <email>. To reset your password, please copy and paste the address below into your web browser's address bar:<br><br><url><br><br>After click on the link you will get a mail with your one time password.<br><br>The Prodonus Support Team <br><br>If you don't want to receive these emails from Prodonus in the future, please write to support@prodonus.com."
		},
		{
			templatetype: "onetimepwd",
			subject: "One Time Password Request for Prodonus",
			description: "Hi, Welcome to Prodonus! Your One Time Password is : <otp> <br><br>From <br><br>Prodonus Team"
		},
		{
			templatetype: "verify",
			subject: "Prodonus Account Activation",
			description: "Thank you for signing up for Prodonus! To activate your account, please copy and paste this address into your web browser's address bar:<br><br><url><br><br>Have fun, and don't hesitate to contact us with your feedback <feedbackurl>.<br><br>- The Prodonus Team <br><br><br>Please do not reply to this e-mail; if you require assistance, please visit our support link <support link url> or write to - support@prodonus.com"
		},
		{
			templatetype: "welcome",
			subject: "Welcome To Prodonus",
			description: "Hi <username>,<br> Welcome to Prodonus! You’ve just joined a community of product manufacturers and users who are sharing their insights on products. <br>At Prodonus, we strive to			 bring business closer to their customers to enable conversation, in addition to managing their	warranties.<br>Talk to manufacturers, interact with consumers from around the world, and explore 			  tons of interesting questions and insights.<br>We are committed to bring all the manufacturers 			  available to everyone.<br><br>Eager to start? Start following the products that interests you, 			  and there’s no limit to the number of products you can follow.<br>We are thrilled that you have 			  joined us! Congratulations! Leave comments and suggestions, and share your story!<br>During your 			  free trial period, you will be able to use prodonus as you would like, of any number of products.			  <br>At the end of the free trial period, you will be asked to select a plan according to the user type - manfacturer's, companies, or individuals .<br><br><br>Cheers,<br><br>Prodonus Team<br><br>You are receiving this email because you registered with Prodonus. Please do not reply directly to noreply@prodonus.com. If you have any questions or feedback, please visit our support link or write to support@prodonus.com<br><br>"
		},
		{
			templatetype: "welcomeinvite",
			subject: "Your Password details",
			description: "Hi <username>,<br> Welcome to Prodonus! Your One Time Password:<password><br>You’ve just joined a community of product manufacturers and users who are sharing their insights on products. At Prodonus, we strive to bring business closer to their customers to enable conversation, in addition to managing their warranties.<br>Talk to manufacturers, interact with consumers from around the world, and explore tons of interesting questions and insights. We are committed to bring all the manufacturers available to everyone.<br>Eager to start? Start following the products that interests you, and there’s no limit to the number of products you can follow.<br>We are thrilled that you have joined us! Congratulations! Leave comments and suggestions, and share your story!<br>During your free trial period, you will be able to use prodonus as you would like, of any number of products. At the end of the free trial period, you will be asked to select a plan according to the user type - individuals, companies, manfacturer's.<br<Cheers,<br>Prodonus Team<br><br>You are receiving this email because <email> is subscribed to Prodonus. Please do not reply directly to noreply@prodonus.com. If you have any questions or feedback, please visit our support link or write to support@prodonus.com"
		},
		{
			templatetype: "orgmemberinvite",
			subject: "Invite from <orgname> for <grpname> group ",
			description: "Welcome to Prodonus. Your organization <b><orgname></b>, has subscribed to the new Prodonus Platform. You are added as a member of <b><grpname></b> group. To activate your account with Prodonus, click the link below and then signin using one-time-password you received after activating your account.<p><url><br><br><br>Prodonus is a warranty and social network platform for products, enabling conversations, building relationships and gathering real-time market intelligence from customers. We bring business closer to customers to engage them more directly. It helps to share your concerns, complaints, compliments, innovative ideas, business perspectives and product recommendations among the manufacturing business and product consumers.<br><br>Cheers,<br>Prodonus Team.<br><br>You are receiving this email because your company has subscribed to Prodonus. Please do not reply directly to this email (noreply@prodonus.com). If you have any questions please write to support@prodonus.com"
		},
		{
			templatetype: "orgmemberonlyinvite",
			subject: "Invite from <orgname> for <grpname> group",
			description: "Welcome to Prodonus. Your organization <b><orgname></b>, has subscribed to the new Prodonus Platform. You are added as a member of <b><grpname></b>  group. Prodonus is a warranty and social network platform for products, enabling conversations, building relationships and gathering real-time market intelligence from customers. We bring business closer to customers to engage them more directly. It helps to share your concerns, complaints, compliments, innovative ideas, business perspectives and product recommendations among the manufacturing business and product consumers.<br><br>Cheers,<br>Prodonus Team<br><br>You are receiving this email because your company has subscribed to Prodonus. Please do not reply directly to this email (noreply@prodonus.com).If you have any questions please write to support@prodonus.com "
		},
		{
			templatetype: "userinvite",
			subject: "Invite From Prodonus ",
			description: "Dear <name>,<br>I have subscribed to Prodonus (https://www.prodonus.com) that offers social network and warranty platform for products, enabling conversations with product manufacturers or service providers. It helps to share our concerns, complaints, compliments, innovative ideas, business perspectives and product recommendations with the manufacturing business.<br><br>As a consumer one can follow what's happening on products that you own. Prodonus helps you share your perspective on the products using words, video links and picture/images with manufacturer's and other consumers.<br><br>Conversations are purposeful and intended to catch the manufacturer's attention. Share your views and make it known to other users and manufacturers' immediately. In addition, you can store your product warranty data and get instant access to the warranty data and be notified of changing status immediately, specially expiration status.<br><br>Cheers,<br> Prodonus Team on behalf of <fromusername>"
		},
		{
			templatetype: "orgcustomerinvite",
			subject: "Invite From Prodonus ",
			description: "Hi <customername>,<br>We have subscribed to Prodonus (https://www.prodonus.com) that offers a warranty and social network platform for products, enabling conversations with product manufacturers or service providers. It helps to share our concerns, complaints, compliments, innovative ideas, business perspectives and product recommendations with the manufacturing business.<br><br>As a consumer one can follow what's happening on our products. Prodonus helps you share your perspective on the products using words, video links and picture/images with manufacturer's and other consumers. Conversations are purposeful and intended to catch our attention. Share your views and make it known to the other users and us immediately. In addition, you can store your product warranty data and get instant access to it and also, be notified of changing status immediately, especially expiration status.Eager to start? Signup with prodonus.com and start following our products, and there’s no limit to the number of products you can follow.<br><br>Sincerely,<br><fromusername> from <b><orgname></b><br><br>You are receiving this email because your are one of the important customers of <b><orgname></b> subscribed to Prodonus. Write to support@prodonus.com and for any business enquiries write to business@prodonus.com"
		},
		{
			templatetype: "otherorginvite",
			subject: "Invite From Prodonus on behalf of <fromusername>(<orgname>)",
			description: "Dear <name>,<br><br>We've got great news. Today we're excited to tell you how you can come closer to your customers, get to know their needs, understand their issues, complaints better, and also engage them to create innovative ideas, in addition to managing their warranties.<br><br>We offer a warranty and social platform for products, for all product manufacturers and their customers sharing their insights on products. Prodonus is a social network and warranty platform for products, enabling conversations, building relationships and gathering real-time market intelligence from customers. We bring business closer to customers to engage them more directly. It helps to share your concerns, complaints, compliments, innovative ideas, business perspectives and product recommendations among the manufacturing business and product consumers.<br><br>We look forward to meeting you to discuss your requirements to signup on our new platform.<br><br>All the best,<br><br><fromusername>( <orgname> )<br><br>You are receiving this email because your friend <from username> referred you to us and mentioned you might be interested to subscribe to Prodonus. If you have any further questions, please write to business@prodonus.com. We would get in touch with you."
		},
		{
			templatetype: "removememberonlyfromorg",
			subject: "Your organization <orgname> removed from group <grpname>",
			description: "Dear <tousername>,<br><br>This notice is to inform that you have been deleted from the group <b><grpname></b> of <b><orgname></b> by <b><adminuser></b>.<br><br>If you feel this action has occurred in error or you need further assistance, please write to our support staff at support@prodonus.com or better contact your organization admin.<br><br>Thanks again for being a Prodonus customer.<br><br>Sincerely,<br><br>Prodonus Team"
		},
		{
			templatetype: "removememberfromorganduser",
			subject: "Your organization <orgname> removed from group <grpname> and Your account set to deactive",
			description: "Dear <tousername>,<br><br>This notice is to inform that you have been deleted from the group <b><grpname></b> of <b><orgname></b> by <b><adminuser></b> and as a user of Prodonus your account is deactivated and would be removed permanently during our recurring maintenance cycle.<br><br>If you feel this action has occurred in error or you need further assistance, please write to our support staff at support@prodonus.com or better contact to your organization admin.<br><br>Thanks again for being a Prodonus customer.<br><br>Sincerely,<br><br>Prodonus Team"
		},
		{
			templatetype: "emailchange",
			subject: "Your email has been changed",
			description: "Dear <user>,<br><br>This notice is to inform that your email has been changed from <oldemail> to <newemail>.<br><br>If you feel this action has occurred in error or you need further assistance, please write to our support staff at support@prodonus.com <br><br>Sincerely,<br><br>Prodonus Team"
		},
		{
			templatetype: "passwordchange",
			subject: "Your password has been changed",
			description: "Dear <user>,<br><br>This notice is to inform that your password has been changed. Your current password is <b><newpassword><b>. If you feel this action has occurred in error or you need further assistance, please write to our support staff at support@prodonus.com <br><br>Sincerely,<br><br>Prodonus Team"
		},
		{
			templatetype: "orgdeletenotification",
			subject: "Your Organization <orgname> has been unsubscribed from prodonus",
			description: "Dear <name>,<br><br>This notice is to inform that your organization <orgname> has choose to unsubscribe with prodonus. As a result your accounts have been deactivated and would be later deleted as per company's maintenance activity.<br><br>If you feel this action has occurred in error or you need further assistance, please write to our support staff at support@prodonus.com or contact your organization admin for Prodonus.<br><br>Thanks again for being a Prodonus customer.<br><br>Sincerely,<br><br>Prodonus Team"
		},
		{
			templatetype: "orgdeletereqnotification",
			subject: "Organization Delete Request from <orgname>",
			description: "Dear Prodonus Team,<br><br><orgname> has requested to be deleted from the prodonus platform. Please ensure the organization deactivation process is initiated as per the prodonus company policies. <br><br>From,<br><br><orgname>"
		},
		{
			templatetype: "activateaccount",
			subject: "Activate Account Request",
			description: "Dear <email> You are requested to activate your account,So to activate your account please copy and pasteu this address into your web browser's address bar:<br><br><url><br><br>Have fun, and don't hesitate to contact us with your feedback <feedbackurl>.<br><br>- The Prodonus Team <br><br><br>Please do not reply to this e-mail; if you require assistance, please visit our support link <support link url> or write to - support@prodonus.com"
		},
		{
			templatetype: "authorregistrationsuccess",
			subject: "Blog Author Request",
			description: "Dear <email>,<br><br> Prodonus received a request for blog author.<br><br> Please wait for reply from Prodonus<br><br>After successful verifiaction of your application you will get a mail of accepatance for your application.<br><br>The Prodonus Support Team <br><br>If you don't want to receive these emails from Prodonus in the future, please write to support@prodonus.com."
		}, 
		{
			templatetype: "authoracceptance",
			subject: "Blog Author Request Accepted",
			description: "Dear <email> Congratulations,<br><br> Prodonus accepated your request for blog author.<br><br>"
		},
		{
			templatetype: "authorrejection",
			subject: "Blog Author Request Rejected",
			description: "Dear <email>,<br><br> Thanks to create blog for Prodonus, Prodonus rejected your request for blog author.<br><br>"
		}]


     for(var i=0;i<emailtemplatedata.length;i++){
		EmailTemplateModel.update({templatetype:emailtemplatedata[i].templatetype},{$set:emailtemplatedata[i]},{upsert:true},function(err,langcodeupdatestatus){
			if(err){
				//res.send("error in db ")
				// logger.error("error in db");
			}else if(langcodeupdatestatus==1){
				//res.send("Workcategory uploaed");
				// logger.log("log","subscriptionarray loaded loaded");
				console.log("emailtemplate :"+i);
			}else{
				//res.send("");
				// logger.error("log","ssssssss");
			}
		})
	};
	res.send("default email template loads");
}


//first time
