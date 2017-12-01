/**
*Created by: Jean Fredo Louis
* Display the causes of death using the ICD Codes and the display text of those ICDs
*
*/


class CausesOfDeath {

    //Initializes the svg elements required for this chart;

     constructor(){

         this.margin = {top: 30, right: 20, bottom: 30, left: 50};
         this.svgWidth = 400;
         this.svgHeight = 400;

         let divCausesChart = d3.select("#topTen");
         this.svg = divCausesChart.append("svg")
         	        .attr("width",this.svgWidth)
         	        .attr("height",this.svgHeight)
     }

     tooltip_render(tooltip_data) {
         let text = "<h4>" + tooltip_data.Cause_of_Death + "</h4>";
         text +=  "<div>Deaths: " + tooltip_data.deaths+"</div>";
         //text += "<div>Rate per 100,000: " + tooltip_data.rate+"</div>";


         return text;
     }


update(year){
  let codData = datamodel.getData("CauseOfDeath", "all",year)

  let tip = d3.tip().attr('class', 'd3-tip')
      .direction('w')
      .offset(function() {
          return [0,0];
      })
      .html((d)=>{
          // populate data in the following format
          let tooltip_data = {
              "Cause_of_Death": d.Cause_of_Death,
              "deaths":d.Num_Deaths
            }

           // pass this as an argument to the tooltip_render function then,
           // return the HTML content returned from that method.

          return this.tooltip_render(tooltip_data);
      });
      this.svg.call(tip)

      let codDataSrt = codData.sort(function (a, b) {
        return b.Num_Deaths - a.Num_Deaths;
      });

      // let totDeath = this.codDate.map(d=>{return d.Num_Deaths})
      let xScale = d3.scaleLinear()
                      .domain([0, d3.max(codData, d => parseInt(d.Num_Deaths))])
                      .range([0, this.svgWidth-30]);
      //
      //         // Create colorScale
              let colorScale = d3.scaleLinear()
                      .domain([0, d3.max(codData, d => parseInt(d.Num_Deaths))])
                      .range(["#FABDBD", "#FF1B00"]);

      // Define the div for the tooltip
      let div = d3.select("#topTen").append("div")
          .attr("class", "tooltip")
          .style("opacity", 0);


      let causesRect = this.svg
                      .selectAll('rect')
                      .data(codDataSrt);
        let causesRect_new = causesRect.enter().append('rect').on('mouseover', tip.show).on('mouseout', tip.hide);
        causesRect.exit().remove();
        causesRect = causesRect_new.merge(causesRect);

        causesRect.transition()
                  .duration(500)
                  .attr('x', 0)
                  .attr('y', function(d,i) {
                          return (i*25);
                  })
                  .attr('width', d => {
                    let NumDeaths = parseInt(d.Num_Deaths);
                    return xScale(NumDeaths);
                  })
                  .attr('height', 20)
                  .attr('fill', function (d) {
                    return colorScale(d.Num_Deaths);
                  })

      };

}
