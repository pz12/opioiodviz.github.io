

function viz(){




  var w = 200,
      h = 200
  var svg = d3.select('#daysOfWeek')
    .append('svg')
    .attr('width', w)
    .attr('height', h)
    .style('border', 'gray solid 1px')
  svg.append('text')
    .text('Days of the Week')
    .attr('x', 50)
    .attr('y', 20)

  var line = d3.lineRadial()
    .radius(function(d, i){ return 60 ; })
    .angle(function(d){ return d * (Math.PI/180) ; })
    .curve(d3.curveCardinalOpen);
  //links to different curves available
  // https://codepen.io/alsheuski/pen/BKQmaz
  // http://bl.ocks.org/emmasaunders/c25a147970def2b02d8c7c2719dc7502
  // var data = [ -90, -50, 0, 50, 100, 125, 175, 230, 270, 310, 350, 390];
  var data = [ -90, -50, 0, 50, 90, 125, 175, 270, 310, 360];

  var path = svg.append('path')
    .datum(data)
    .attr('d', line)
    .attr('stroke', 'green')
    .attr('stroke-width', 3)
    .attr('fill', 'white')
    .attr('transform', 'translate(' + w/2 +','+ h/2 +')')
    .attr('d', line);
  svg.append('circle')
    .attr('r', 60)
    .attr('stroke', 'gray')
    .attr('stroke-width', 2)
    .attr('opacity', 0.8)
    .attr('fill', 'none')
    .attr('cx', function(d) {
      return w/2
    })
    .attr('cy', function(d) {
      return h/2
    })


    // let width = 400;
    // let height = 400;
    // svg = d3.select('#topTen')
    //           .append('svg')
    //           .attr('width', width)
    //           .attr('height', height)
    // svg.append('text')
    //   .text('Top 10 Reasons for Death')
    //   .attr('x', 20)
    //   .attr('y', 15)
    // data = [200,180,150,140]
    // let list = svg.selectAll('rect')
    //               .data(data)
    // list.enter().append('rect')
    //             .attr('x', 0)
    //             .attr('y', function(d,i) {
    //               return i*20+50;
    //             })
    //             .attr('width', function(d) {
    //               return d;
    //             })
    //             .attr('height', 20)
    //             .attr('fill', 'red')

width = 1200;
height = 800;
let results;
let year = "2015";

d3.tsv('data/TotalsByStateByYear.txt', (error, stateResults) => {

  stateResults = stateResults.filter(( obj ) => {

    return obj.Year === year;
});
console.log(stateResults)
let radiusScale = d3.scaleLinear()
                    .domain([0, d3.max(stateResults, d => d['Crude Rate'])])
                    .range([0,8]);

  svg = d3.select('#USmap')
            .append('svg')
            .attr('width', width)
            .attr('height', height)
  svg.selectAll('circle')
                  .data(stateResults)
                  .enter()
                  .append('circle')
                  .attr('cx', (d) => {
                    return d.Space*50;
                  })
                  .attr('cy', (d) => {
                    return d.Row*40;
                  })
                  .attr('r', (d) => {
                    return radiusScale(d['Crude Rate']);
                  })
                  // .attr('width', (d) => {
                  //   return Math.random() * (50 - 40) + 40;
                  // })
                  // .attr('height', (d) => {
                  //   return Math.random() * (50 - 40) + 40;
                  // })
                  .attr('fill', 'red')
                  .attr('stroke', 'black')
                  .attr('class', 'tile')



    // https://stackoverflow.com/questions/34934577/html-range-slider-with-play-pause-loop
    // var myTimer;
    // d3.select("#play_button").on("click", function() {
    //  clearInterval (myTimer);
    // 	myTimer = setInterval (function() {
    //     	var b= d3.select("#rangeSlider");
    //       var t = (+b.property("value") + 1) % (+b.property("max") + 1);
    //       if (t == 0) { t = +b.property("min"); }
    //       b.property("value", t);
    //       //update (t);
    //     }, 1000);
    // });
    //
    // d3.select("#pause_button").on("click", function() {
    // 	clearInterval (myTimer);
    // });
});
// console.log(results)

}
