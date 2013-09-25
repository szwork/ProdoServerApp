//....................................code snippet for password pattern check directive.............................
/*overview:
* parameters:
*
*/

var app2 = angular.module("app.directives", [], function() {});
app2.directive('prodonusPasswordValidate', function() {
    return {
        require: 'ngModel',
        link: function(scope, elm, attrs, ctrl) {
            ctrl.$parsers.unshift(function(viewValue) {

                scope.pwdValidLength = (viewValue && viewValue.length >= 8 ? 'valid' : undefined);
                scope.pwdHasAlphabet = (viewValue && /[A-z]/.test(viewValue)) ? 'valid' : undefined;
                scope.pwdHasNumber = (viewValue && /\d/.test(viewValue)) ? 'valid' : undefined;
                scope.pwdHasSymbol = (viewValue && /(?=(?:.*[!@#$%^&*-]){1})/.test(viewValue)) ? 'valid' : undefined;

                if(scope.pwdValidLength && scope.pwdHasAlphabet && scope.pwdHasNumber && scope.pwdHasSymbol) {
                    ctrl.$setValidity('pwd', true);
                    return viewValue;
                } else {
                    ctrl.$setValidity('pwd', false);                    
                    return undefined;
                }

            });
        }
    };
});
 