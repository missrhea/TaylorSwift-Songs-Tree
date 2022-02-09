(function (d3) {
    'use strict';
  
    var width = document.body.clientWidth-(document.body.clientWidth/3),
    height = document.body.clientHeight,
    svg = d3.select("svg")
      .attr("width", width)
      .attr("height", height),
    g = svg.append("g").attr('transform', `translate(0,0)`),
    cluster = d3.cluster()
      .size([2 * Math.PI, width/2 - 150]),
    fontSize = d3.scaleSqrt()
      .range([30, 7]);

g.append("rect")
  .attr("width", width)
  .attr("height", height)
  .style("fill", "none")
  .style("pointer-events", "all")
  .call(d3.zoom()
      .scaleExtent([1 / 2, 4])
      .on("zoom", zoomed));

function zoomed() {
  g.attr("transform", d3.event.transform);
}

d3.json("data.json")
.then(data => {
  var hierarchy = d3.hierarchy(data);
  cluster(hierarchy);
  var descendants = hierarchy.descendants();

  fontSize.domain(d3.extent(descendants, function (d){return d.depth; }))
  
  var link = g.selectAll(".link")
      .data(descendants.slice(1))
    .enter().append("path")
      .attr("class", "link")
      .attr("d", function(d) {
        if(d.parent === descendants[0]){
          return "M" + project(d.x, d.y)
            + " " + project(d.parent.x, d.parent.y);
        } else {
          return "M" + project(d.x, d.y)
            + "C" + project(d.x, (d.y + d.parent.y) / 2)
            + " " + project(d.parent.x, (d.y + d.parent.y) / 2)
            + " " + project(d.parent.x, d.parent.y);
        }
      });
  
  var node = g.selectAll(".node")
      .data(descendants)
    .enter().append("g")
      .attr("transform", function(d) {
        return "translate(" + project(d.x, d.y) + ")";
      });

  node.append("text")
    .text(function (d){
      console.log(d);
      return d.data.data.id;
    })
    .attr("font-size", function (d){
      if (d.depth != 0){
        return 1 / (d.depth) + "em";
      }
      return 2 + "em";
    })
    .attr("transform", function(d) {
      var theta = -d.x / Math.PI * 180 + 90;
      if(d.x > Math.PI){
        theta += 180;
      }
      if(d.depth !== 2 && Math.abs(theta) < 30){
        theta = 0;
      }
      if(d.depth > 1){
        return "rotate(" + theta + ")";
      } else {
        return "";
      }
    })
    .attr("text-anchor", function (d){
      if(d.depth === 2){
        return (d.x > Math.PI) ? "end" : "start";
      } else {
        return "middle";
      }
    })
    .attr("dx", function (d){
      if(d.depth === 2){
        return (d.x > Math.PI) ? "-2px" : "2px";
      } else {
        return "0px";
      }
    })
    .classed("glow", function (d){
      return d.depth !== 2;
    })
    .attr("alignment-baseline", "central")
    .attr("fill", function(d){return d.data.data.color });
});

function project(theta, r){
  return [
    width / 2 + r * Math.sin(theta),
    height / 2 + r * Math.cos(theta) + 4
  ]
}
  }(d3));
  