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
      renderMap();
  });
  resp.error(function(data, status, headers, config) {
      alert(status);
  });
};

var app = angular.module("HikeApp", []);
app.controller('HikeController', PopularHikes);

/*
 * The D3 code should go elsewhere and have the AngularJS scoped variable passed to it.
 */
function renderD3(matrix) {

  /*
   * Data from JSON isn't ideal for mapping the relationships.
   * Using the manual data below for now.
   * Will need to create a ranking algorithm based on multiple categories.
   */
  matrix = [
//  OR, WO, SK, CF, SK
    [6, 1, 6, 4, 5], //6 - Old Rag
    [1, 1, 1, 3, 2], //1 - White Oak
    [6, 1, 6, 4, 2], //6 - Strickler Knob
    [4, 3, 4, 4, 5], //4 - Crabtree Falls
    [5, 2, 5, 5, 5], //5 - Signal Knob
  ];

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
          .on("mouseover", fade(.1))
          .on("mouseout", fade(1));

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
      
      function fade(opacity) {
        return function(g, i) {
          svg.selectAll(".chord path")
            .filter(function(d) { return d.source.index != i && d.target.index != i; })
            .transition()
            .style("opacity", opacity);
        };
      }
}

/*
 * This shouldn't go here either.
 * For brevity, I added JS code to this file. It'll be put in its proper place later.
 */
function renderMap() {
  var map = new ol.Map({
        target: 'map',
        layers: [
          new ol.layer.Tile({
            source: new ol.source.OSM({layer: 'sat'})
          })
        ],
        view: new ol.View({
          center: ol.proj.transform([-78.28705, 38.57036], 'EPSG:4326', 'EPSG:3857'),
          zoom: 13
        })
      });
}
