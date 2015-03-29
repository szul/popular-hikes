var PopularHikes = function($scope, $http) {
  $scope.info = "Popular Hikes according to Hiking Upward";
  $scope.results = {};
  $scope.matrix = [];
                
  var resp = $http.get("data.json");

  resp.success(function(data, status, headers, config) {
      $scope.results = data;
      for(var i = 0; i < data.hikes.length; i++) {
        $scope.matrix.push(data.hikes[i].ratings);
        //Only take the top five for the chord matrix.
        if ($scope.matrix.length == 5) {
          break;
        }
      }
      renderD3($scope.matrix);
  });
  resp.error(function(data, status, headers, config) {
      alert(status);
  });
};

var app = angular.module("HikeApp", []);
app.controller('HikeController', PopularHikes);

/*
 * The D3 code should probably go elsewhere and have the AngularJS scoped variable passed to it.
 */
function renderD3(matrix) {

  var width = 550;
  var height = 550;
  var svg = d3.select("#chord")
       .append("svg")
       .attr("width", width)
       .attr("height", height)
       .append("g")
       .attr("transform","translate(" + width / 2 + "," + height / 2 + ")");
  
  //Put these color ranges in a configuration file.
  var range = ["#8c8c8c", "#49708a", "#d0e0eb", "#82b3ae", "#bce3c5"];
  var fill = d3.scale.ordinal()
     .domain(d3.range(range.length))
     .range(range);
  var innerRadius = Math.min(width, height) * .41;
  var outerRadius = innerRadius * 1.1;
  var chord = d3.layout.chord()
     .padding(.05)
     .sortSubgroups(d3.descending)
     .matrix(matrix);
  
  svg.append("g")
     .selectAll("path")
     .data(chord.groups)
     .enter().append("path")
     .style("fill", function(d) {
          return fill(d.index);
     })
     .style("stroke", function(d) {
          return fill(d.index);
     })
    .attr("d", d3.svg.arc()
          .innerRadius(innerRadius)
          .outerRadius(outerRadius))
  
    svg.append("g")
      .attr("class", "chord")
      .selectAll("path")
      .data(chord.chords)
      .enter().append("path")
      .style("fill", function(d) {
          return fill(d.target.index);
      })
      .attr("d", d3.svg.chord().radius(innerRadius))
      .style("opacity", 1);
}
