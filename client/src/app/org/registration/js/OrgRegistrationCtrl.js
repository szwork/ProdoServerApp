 
 
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
    .state('home.subscription', {
        url: '/subscription',
        templateUrl: 'org/registration/views/subscription.tpl.html'
      })
    .state('forgotEmail', {
        url: '/forgotEmail',
        templateUrl: 'user/views/forgot.email.tpl.html'
      })
       
  }]); 
  //...................... controller........................
app.controller("OrgRegistrationCtrl", ['$scope', '$state',  function($scope, $http, $state) {

 
    $scope.password1 = "";
    $scope.user = {};
 
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
                $scope.org = $scope.orgs[0];

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
 
  





















 
 

 