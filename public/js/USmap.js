

class USmap {

  constructor() {
    this.width = 850;
    this.height = 470;
    this.svg = d3.select('#USmap')
              .append('svg')
              .attr('width', this.width)
              .attr('height', this.height);

    // LEGEND
    var legend_color = 'gray';
    var legend_y = 70;
    var tick_height = 10;
    var tick_place = legend_y + tick_height;
    var legend_x_start = 350;
    var legend_width = 96; //equivalent to a crude rate of 40
    var legend_x_end = legend_x_start+legend_width;
    var halfway = legend_width/2+legend_x_start;
    this.svg.append('path')
            .attr('d', (d) => {
              return 'M'+legend_x_start+','+legend_y+'L'+legend_x_end+','+legend_y;
            })
           .attr('stroke', legend_color)
           .attr('stroke-width', 2)
           .attr('fill', 'none');
   this.svg.append('path')
           .attr('d', (d) => {
             return 'M'+legend_x_end+','+tick_place+'L'+legend_x_end+','+legend_y;
           })
          .attr('stroke', legend_color)
          .attr('stroke-width', 2)
          .attr('fill', 'none');
    this.svg.append('path')
            .attr('d', (d) => {
              return 'M'+legend_x_start+','+tick_place+'L'+legend_x_start+','+legend_y;
            })
           .attr('stroke', legend_color)
           .attr('stroke-width', 2)
           .attr('fill', 'none');
   this.svg.append('path')
           .attr('d', (d) => {
             return 'M'+halfway+','+tick_place+'L'+halfway+','+legend_y;
           })
          .attr('stroke', legend_color)
          .attr('stroke-width', 2)
          .attr('fill', 'none');
    this.svg.append('text')
          .text('0')
          .attr('x', (d) => {
            return legend_x_start-4;
          })
          .attr('y', (d) => {
            return tick_place+15;
          })
          .attr('class', 'USmapLegendText');
    this.svg.append('text')
          .text('20')
          .attr('x', (d) => {
            return halfway-8;
          })
          .attr('y', (d) => {
            return tick_place+15;
          })
          .attr('class', 'USmapLegendText');
    this.svg.append('text')
          .text('40')
          .attr('x', (d) => {
            return legend_x_end-8;
          })
          .attr('y', (d) => {
            return tick_place+15;
          })
          .attr('class', 'USmapLegendText');
    this.svg.append('text')
          .text('Crude Rate (per 100,000)')
          .attr('x', (d) => {
            return legend_x_start-25;
          })
          .attr('y', (d) => {
            return tick_place-20;
          })
          .attr('class', 'USmapLegendText')
  }

  /**
     * Renders the HTML content for tool tip.
     *
     * @param tooltip_data information that needs to be populated in the tool tip
     * @return text HTML content for tool tip
     */
    tooltip_render(tooltip_data) {
        let text = "<h2 class ='yes' >" + tooltip_data.state + "</h2>";
        text +=  "<div >Deaths: " + tooltip_data.deaths+"</div>";
        text += "<div>Rate per 100,000: " + tooltip_data.rate+"</div>";


        return text;
    }


update(year) {
  let stateResults = datamodel.getData("Totals", "all",year);
  //Use this tool tip element to handle any hover over the chart
  let tip = d3.tip().attr('class', 'd3-tip')
      .direction('se')
      .offset(function() {
          return [0,0];
      })
      .html((d)=>{
          // populate data in the following format
          let tooltip_data = {
              "state": d.State,
              "deaths":d.Deaths,
              "rate" : d['Crude Rate']
            };

           // pass this as an argument to the tooltip_render function then,
           // return the HTML content returned from that method.

          return this.tooltip_render(tooltip_data);
      });
      this.svg.call(tip)
  let colorScale = d3.scaleLinear()
          .domain([0, 20])
          .range(["white", "#FF1B00"]);

let results;
for(let i=0; i<stateResults.length; i++) {
  if(stateResults[i]['Crude Rate'] == 'Unreliable') {
    stateResults[i]['Crude Rate'] = "2.0";
  }
}

let radiusScale = d3.scaleLinear()
                    .domain([0, 10])
                    .range([0,12]);


  let uschart = this.svg.selectAll('circle')
                  .data(stateResults);
                  uschart.exit()
                          .transition()
                          .duration(500)

                        .remove()
                 uschart = uschart.enter().append('circle')
                                    .attr('class', 'tile')
                                    .on('mouseover', tip.show)
                                   .on('mouseout', tip.hide)

                                   .merge(uschart);
                  uschart.on('click', function(d) {
                      weekdays.update(year, d.State);
                      race.update(year, d.State);
                     gender.update(year, d.State);
                     var tempbool = timerBool;
                     updateCurrentState(d.State)
                     pause();
                     d3.selectAll('.activeState').classed("activeState", false);
                     d3.select(this).classed("activeState", true);
                   if(tempbool==true) {
                     play();
                   }
                 }).transition()
                  .duration(500)
                  .attr('cx', (d) => {
                    return d.Space*70+25;
                  })
                  .attr('cy', (d) => {
                    return d.Row*60+25;
                  })
                  .attr('r', (d) => {
                    return radiusScale(d['Crude Rate']);
                  })
                  .attr('fill', (d) => {
                    return colorScale(d['Crude Rate']);
                  })
                  .attr('stroke', 'black');


  // var line = d3.svg.line()
  //                .x(function(d) { return radiusScale(d['x']); })
  //                .y(function(d) { return radiusScale(d['y']); });
  // this.svg.append('line')
  //         .data([{'x': 1, 'y': 3},
  //               {'x': 2, 'y': 5}])
  //         .attr('d', line)
  //         .attr('stroke', 'gray')
  //         .attr('stroke-width', 2)
  //         .attr('fill', 'none')






// console.log(results)
}


}
