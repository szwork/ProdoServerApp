
var nodemailer = require("nodemailer");
//authentication  about send email
var smtpTransport = nodemailer.createTransport("SMTP", {
    host: "smtp.gmail.com", // hostname
    secureConnection: true, // use SSL
    port: 465, // port for secure SMTP
    auth: {
        user: "sunilmore690",
        pass: "anil_sharad90"
      }
});

//send an email
exports.sendMail = function(message,callback){
  smtpTransport.sendMail(message, 
 	  function (error, success) {
      if (error){
        // not much point in attempting to send again, so we give up
        // will need to give the user a mechanism to resend verification
        console.error("Unable to send via Prodonus: " + error.message);
        callback("failure");
      }
      //sending succussful then success
      callback("success"); 
    });
};