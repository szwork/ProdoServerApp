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