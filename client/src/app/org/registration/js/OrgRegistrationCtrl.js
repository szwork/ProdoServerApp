 
 
var app= angular.module("ProdonusApp", ['ui.router', 'app.directives'], function() {} );

      
      app.config(['$stateProvider', '$urlRouterProvider', function($stateProvider, $urlRouterProvider) {
    
    $urlRouterProvider.otherwise('/home/signup');

    $stateProvider
    .state('home', {
      abstract: true,
      url: '/home',
      templateUrl:  'common/layouts/landing.layout.tpl.html'
    })
    .state('home.signin', {
        url: '/signin',
        templateUrl:  'user/views/signin.tpl.html'
      })
    .state('prodonus', {
        url: '/prodonus',
        templateUrl: 'common/layouts/prodonus.layout.tpl.html'
      })
    .state('home.signup', {
        url: '/signup',
        templateUrl:  'user/views/signup.tpl.html'
      })
    .state('home.company', {
        url: '/company',
        templateUrl: 'org/registration/views/company.tpl.html'
      })
    .state('home.contact', {
        url: '/contact',
        templateUrl: 'org/registration/views/contact.tpl.html'
      })
    .state('home.address', {
        url: '/address',
        templateUrl: 'org/registration/views/address.tpl.html'
      })
    .state('home.groupuser', {
        url: '/groupuser',
        templateUrl: 'org/registration/views/groupusers.tpl.html'})
    .state('home.terms', {
        url: '/terms',
        templateUrl: 'user/views/prodonus.terms.tpl.html'
      })
    .state('subscription', {
        url: '/subscription',
        templateUrl: 'org/registration/views/subscription.tpl.html'
      })
    .state('forgotEmail', {
        url: '/forgotEmail',
        templateUrl: 'user/views/forgot.email.tpl.html'
      }) 
    .state('home.display', {
        url: '/display',
        templateUrl: 'org/registration/views/display.tpl.html'
      }) 
       
  }]); 
  //...................... controller........................
app.controller("OrgRegistrationCtrl", ['$scope', '$state',  function($scope, $http, $state, OrgModel) {

    $scope.org=OrgModel;
    $scope.password = "";
    $scope.user = {};
//...................................................................................
      
        
//................................code for post method...............................
var method = 'POST';
    var inserturl = 'http://192.168.1.3:4000/signup'; // URL where the Node.js server is running
    $scope.codeStatus = "";
    $scope.save = function() {
    // Preparing the Json Data from the Angular Model to send in the Server. 
    var formData = {
      'fullname' : this.fullname,
      'email' : this.email,
    'password' : this.password
    };

  this.fullname = '';
  this.email = '';
  this.password = '';

  var jdata = 'mydata='+JSON.stringify(formData); // The data is to be string.

  $http({ // Accessing the Angular $http Service to send data via REST Communication to Node Server.
            method: method,
            url: inserturl,
            data:  jdata ,
            headers: {'Content-Type': 'application/x-www-form-urlencoded'},
       
        }).
        success(function(response) {
                console.log("success"); // Getting Success Response in Callback
                $scope.codeStatus = response.data;
                console.log($scope.codeStatus);
             

        }).
        error(function(response) {
    console.log("error"); // Getting Error Response in Callback
                $scope.codeStatus = response || "Request failed";
    console.log($scope.codeStatus);
        });
         
  };  


 
//--------------------------------code snippet for Organization Types---------------------------------------------
//-------------------- to be changed and options to be retrieved from database................
$scope.orgs = [
                {name:'--Select Organization Type--'},
                {name:'Manufacturers'},
                {name:'Distributors' },
                {name: 'Resellers'},
                {name: 'Retailers'},
                {name: 'Service Centers'},
              ];
                $scope.org=[ {name:''} ];

//------------------------------Add multiple contacts---------------------------------------
 $scope.contacts=[ {value:''} ];
  $scope.addContact = function() { $scope.contacts.push({value:''}); };
 
  $scope.removeContact = function(contact) {
    var contacts = $scope.contacts;
      for (var i = 1, ii = contacts.length; i < ii; i++) {
        if (contact === contacts[i]) { contacts.splice(i, 1); }
        else contacts.splice(i,0);
      }
    };            

//------------------------------Add multiple emails---------------------------------------
 // $scope.emails=[ {value:''} ];
 //  $scope.addEmail = function() { $scope.emails.push({value:''}); };
 
 //  $scope.removeEmail = function(email) {
 //    var emails = $scope.emails;
 //      for (var i = 0, ii = emails.length; i < ii; i++) {
 //        if (email === emails[i]) { emails.splice(i, 1); }
 //      }
 //    };            
 
}]);
 
  





















 
 

 