 
 
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
 

//--------------------------------code snippet for User Signin--------------------------------------------

    $scope.showValidationMessage = false;
        $scope.signin = function () {
          $scope.showValidationMessage = true;
          return false;
        };
    
//--------------------------------code snippet for creating tab and switching tabs---------------------------------------------
	 

	 $scope.tabs = [
      { link : '#!/company', label : 'Company' },
      { link : '#!/groupusers', label : 'Group Users' },
      { link : '#!/payment', label : 'Payments' }
      
    ]; 
    
  $scope.selectedTab = $scope.tabs[0]; // by default first tab in the array is selected   
  $scope.setSelectedTab = function(tab) {
    $scope.selectedTab = tab;
  }
  
  $scope.tabClass = function(tab) {
    if ($scope.selectedTab == tab) {
      return "active";
    } else {
      return "";
    }
  }




//................... Code snippet for post data on submit button of Company template.............

		var method = 'POST';
// URL where the Node.js server is running and needs to be changed this is temporary
  		var inserturl = 'http://localhost:3000'; 
  		$scope.codeStatus = "";


  		      $scope.save = function() {
    // Preparing the Json Data from the Angular Model to send in the Server. 
    		var formData = {
      			'companyname' : this.m.companyname,
      			'contractid' : this.m.contractid,
     			'address1' : this.m.address1,
      			'address2' : this.m.address2,
      			'address3' : this.m.address3,
      			'city' : this.m.city,
      			'state' : this.m.state,
	  			'zipcode' : this.m.zipcode
   };

	 
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
        $scope.alerts.push({type: 'success', msg: "Data added successfully!!"});
    


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
 
  





















 
=======

//------------------------------ code for reset Function------------------------------------------    

	 // $scope.reset = function() {
	 // 	 this.m.companyname="";
  //  		 this.m.contractid="";
  //   	 this.m.address1="";
  //   	 this.m.address2="";
  //   this.m.address3="";
  //   	 this.m.city="";
  //   	 this.m.state="";
		//  this.m.zipcode="";

	 // };	



});
>>>>>>> 9cd8ec43677430d6f463f9bc456e9305cd2ff04e
