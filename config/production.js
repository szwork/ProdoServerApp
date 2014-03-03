module.exports = {
    Prodonus: {
      dbName: "prodo-prod",
      dbHost: "localhost",
      dbPort: "27017",
      debug:false,
      amazonbucket:'prodonus/production',
      serverName:"www.prodonus.com",
      recaptchaPrivateKey:"6LdDj-oSAAAAAJcAYticzZ4NSZ4KzQc9ZbamEHUL",
      recaptchaUrl:"http://www.google.com/recaptcha/api/verify",
      smtp_general:{
        host: "smtp.prodonus.com", // hostname
        secureConnection: true, // use SSL
        port: 465, // port for secure SMTP
        auth:{
         user: "noreply@prodonus.com",
          pass: "Nr12345$"
        }
      },
      smtp_business:{
        host: "smtp.prodonus.com", // hostname
        secureConnection: true, // use SSL
        port: 465, // port for secure SMTP
        auth:{
          user: "business@prodonus.com",
          pass: "Bus12345$"
        }
      }
    }
  }