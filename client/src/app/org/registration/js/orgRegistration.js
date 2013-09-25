 

var app= angular.module("ProdonusApp",['app.directives'], function() {} );

// app.controller('WidgetsController', function($scope) {});

app.config(['$routeProvider', '$locationProvider', function($routeProvider, $locationProvider) {
  $routeProvider.
      when('/company', {templateUrl: 'registration/views/company.tpl.html'}).
      when('/contact', {templateUrl: 'registration/views/contact.tpl.html'}).
      when('/address', {templateUrl: 'registration/views/address.tpl.html'}).
      when('/service', {templateUrl: 'registration/views/service.tpl.html'}).
      when('/terms&conditions', {templateUrl: 'registration/views/terms&conditions.tpl.html'}).
      when('/payment', {templateUrl: 'registration/views/payment.tpl.html'}).
      when('/groupusers', {templateUrl: 'registration/views/groupusers.tpl.html'}).
      when('/signin', {templateUrl: 'registration/views/signin.tpl.html'}).
      when('/signup', {templateUrl: 'registration/views/signup.tpl.html'}).
      otherwise({redirectTo: '/company'});
    }]);
  
  

  //...................... controller........................
app.controller("OrgRegistrationCtrl", function($scope, $http) {

 
    $scope.password1 = "";

//--------------------------------code snippet for User Signin--------------------------------------------

    $scope.showValidationMessage = false;
        $scope.signin = function () {
          $scope.showValidationMessage = true;
          return false;
        };
    
//--------------------------------code snippet for creating tab and switching tabs---------------------------------------------
	 

	 $scope.tabs = [
      { link : '#/company', label : 'Company' },
      { link : '#/groupusers', label : 'Group Users' },
      { link : '#/payment', label : 'Payments' }
      
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
 
  





















 