/**

*/
'use strict';

var orgModule = angular.module('prd.subscribe', []);
var subscribeModule = angular.module('prd.subscribe', []);
var surveyModule = angular.module('prd.survey', []);
var adminModule = angular.module('prd.admin', []);
var reportsModule = angular.module('prd.reports', []);

angular.module('prd.mainapp',['subscribeModule', 'surveyModule', 
    'adminModule', 'reportsModule', 'ngResource'])
.config (['$routeProvider'], function($routeProvider) {
    $routeProvider.
        when('/',
                {
                    templateUrl: 'index.html',
                    controller: 'prd.main.controller'
                } 
            ).
        when ('/subscribe',
                {
                    templateUrl: 'subscribe/views/subscribe.html',
                    controller: 'prd.subscribe.controller'
                }             
            ).
        when('/survey'
                {
                    templateUrl: 'survey/views/survey.html',
                    controller: 'prd.survey.controller'
                } 
            ).
        otherwise (
                {
                  redirectTo: '/index.html'
                }
        );
}]);