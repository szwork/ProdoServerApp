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
* 26-Sept-2013  | Ramesh Kunhiraman | Created the Product Module
***/

var productModule = angular.module('productModule',[]);

//Product service to get the product details from the REST service 
productModule.factory('productService', ['$http', function($http) {
  return new ProductService($http);
}]);

//Update the product model using the Product service
productModule.factory('productModel', ['productService', function(productService) {
  return new ProductModel(productService);
}]);

//product controller 
productModule.controller('productCtrl', ['$scope', 'productModel', ProductCtrl]);