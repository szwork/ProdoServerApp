module.exports = {
    Prodonus: {
      dbName: "prodo-prod",
      dbHost: "localhost",
      dbPort: "27017",
      debug:false,
      serverName:"www.prodonus.com",
      recaptchaPrivateKey:"6LdDj-oSAAAAAJcAYticzZ4NSZ4KzQc9ZbamEHUL",
      recaptchaUrl:"http://www.google.com/recaptcha/api/verify",
      mailhost:"smtp.prodonus.com",
      mailauth_general:{
        user: "noreply@prodonus.com",
        pass: "Nr12345$"
      },
      mailauth_business:{
        user: "business@prodonus.com",
        pass: "Bus12345$"
      }
  }
}