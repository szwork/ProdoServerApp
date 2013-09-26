/***
*Overview: It provides a manifest of the objects used in this module
*Author: Ramesh Kunhiraman
*Date Created: 26-Sept-2013
*Copyright Prodonus Software Private Limited and Giant Leap Systems Private Limited
* ========
* Changes
* ========
* Date          | author            | description
* +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
* 26-Sept-2013  | Ramesh Kunhiraman | Created the User Module
***/

var userModule = angular.module('userModule',[]);

//User service to get the user details from the REST service 
userModule.factory('userService', ['$http', function($http) {
  return new UserService($http);
}]);

//Update the user model using the User service
userModule.factory('userModel', ['userService', function(userService) {
  return new UserModel(userService);
}]);

//login controller 
userModule.controller('loginCtrl', ['$scope', 'userModel', LoginCtrl]);

//user registration controller 
userModule.controller('userRegistrationCtrl', ['$scope', 'userModel', UserRegistrationCtrl]);