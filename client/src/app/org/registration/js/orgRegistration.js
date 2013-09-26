 

var app= angular.module("ProdonusApp", ['ui.router'], function() {} );

// app.controller('WidgetsController', function($scope) {});

// app.config(['$routeProvider', '$locationProvider', function($routeProvider, $locationProvider) {
//   $routeProvider.
//       // when('/', {templateUrl: 'org/registration/views/mainpage.tpl.html', view: 'mainsection'}).
//       when('/', {templateUrl: 'org/registration/views/prodonus.tpl.html', view: 'mainsection'}).
//       when('/company', {templateUrl: 'org/registration/views/company.tpl.html'}).
//       when('/contact', {templateUrl: 'org/registration/views/contact.tpl.html' }).
//       when('/address', {templateUrl: 'org/registration/views/address.tpl.html' }).
//       when('/service', {templateUrl: 'org/registration/views/service.tpl.html' }).
//       when('/terms&conditions', {templateUrl: 'org/registration/views/terms&conditions.tpl.html' }).
//       when('/payment', {templateUrl: 'org/registration/views/payment.tpl.html' }).
//       when('/groupusers', {templateUrl: 'org/registration/views/groupusers.tpl.html' }).
//       when('/signin', {templateUrl: 'org/registration/views/signin.tpl.html' }).
//       when('/signup', {templateUrl: 'org/registration/views/signup.tpl.html' }).
//       otherwise({redirectTo: '/'});
//     }]);
      app.config(['$stateProvider', '$urlRouterProvider', function($stateProvider, $urlRouterProvider) {
    
    $urlRouterProvider.otherwise('/home/signup');

    $stateProvider
    .state('home', {
      abstract: true,
      url: '/home',
      templateUrl:  'org/registration/views/mainpage.tpl.html'
    })
    .state('home.signin', {
        url: '/signin',
        templateUrl:  'org/registration/views/signin.tpl.html'
      })
    .state('prodonus', {
        url: '/prodonus',
        templateUrl: 'org/registration/views/prodonus.tpl.html'
      })
    .state('home.signup', {
        url: '/signup',
        templateUrl:  'org/registration/views/signup.tpl.html'
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
    .state('home.terms&conditions', {
        url: '/terms&conditions',
        templateUrl: 'org/registration/views/terms&conditions.tpl.html'
      })
    .state('home.payment', {
        url: '/payment',
        templateUrl: 'org/registration/views/payment.tpl.html'
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
      for (var i = 0, ii = contacts.length; i < ii; i++) {
        if (contact === contacts[i]) { contacts.splice(i, 1); }
      }
    };            

//------------------------------Add multiple emails---------------------------------------
 $scope.emails=[ {value:''} ];
  $scope.addEmail = function() { $scope.emails.push({value:''}); };
 
  $scope.removeEmail = function(email) {
    var emails = $scope.emails;
      for (var i = 0, ii = emails.length; i < ii; i++) {
        if (email === emails[i]) { emails.splice(i, 1); }
      }
    };            

}]);
 
  





















 