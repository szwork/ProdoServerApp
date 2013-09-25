var ManufacturerRegistrationCtrl = function ($scope) {
  $scope.tabs = [
    { title:"Company", content:"Dynamic content 1" },
    { title:"Service Centers", content:"Dynamic content 2", disabled: true },
    { title:"Service Centers", content:"Dynamic content 2", disabled: true }
  ];

  $scope.alertMe = function() {
    setTimeout(function() {
      alert("You've selected the alert tab!");
    });
  };

  $scope.navType = 'pills';
};