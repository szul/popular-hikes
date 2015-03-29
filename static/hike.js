var PopularHikes = function($scope, $http) {
  $scope.info = "Popular Hikes according to Hiking Upward";
  $scope.results = {};
                
  var resp = $http.get("data.json");

  resp.success(function(data, status, headers, config) {
      $scope.results = data;
  });
  resp.error(function(data, status, headers, config) {
      alert(status);
  });
};

var app = angular.module("HikeApp", []);
app.controller('HikeController', PopularHikes);
