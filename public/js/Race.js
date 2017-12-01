
class Race {

  constructor() {

          this.margin = {top: 30, right: 20, bottom: 30, left: 50};
          this.svgWidth = 300;
          this.svgHeight = 300;

          let divRaceChart = d3.select("#ethnicity")

          this.svg = divRaceChart.append("svg")
                                 .attr("width",this.svgWidth)
                                 .attr("height",this.svgHeight);


        // Scales
        //Formatting and Scales
        this.bottomOffset = 300;
        this.whiteCenter = (this.svgWidth * .2)-this.margin.left;
        this.blackCenter = (this.svgWidth * .4)-this.margin.left;
        this.asianCenter = (this.svgWidth * .6)-this.margin.left;
        this.nativeCenter = (this.svgWidth * .8)-this.margin.left;
        this.categoryScale = d3.scaleOrdinal().domain(["Native", "Asian", "Black", "White" ]).range([this.whiteCenter, this.blackCenter, this.asianCenter, this.nativeCenter]);
        this.xAxisGroup = this.svg.append("g").attr("transform", `translate(0, ${this.svgHeight - this.bottomOffset})`);

        this.rateScale = d3.scaleLinear().domain([65, 0]).range([10, this.svgHeight - 30]);
        this.yAxisGroup = this.svg.append("g").attr("transform", `translate(30, 0)`);
        //Bar Formatting
        this.barWidth = 35;

        //Set up the axis
        let yAxis = d3.axisLeft(this.rateScale);
        let xAxis = d3.axisBottom(this.categoryScale);
        this.xAxisGroup.call(xAxis).attr("transform","translate(45,275)" );
        this.yAxisGroup.call(yAxis);
        this.svg.selectAll("text").attr("font-size", 16);
        }


        tooltip_render(tooltip_data) {
            let text = "<h2 class ='yes' >" + tooltip_data.race + "</h2>";
            text +=  "<div>Deaths: " + tooltip_data.deaths+"</div>";
            text += "<div>Rate per 100,000: " + tooltip_data.rate+"</div>";
            return text;
        }

 update(year, state) {
    let raceData = datamodel.getData("Race", state, year);

    let tip = d3.tip().attr('class', 'd3-tip')
    // .attr("transform","translate(0,0) scale(-1,-1)" )
        .direction('sw')
        .offset(function() {
            return [-65,0];
        })
        .html((d)=>{
            // populate data in the following format
            let tooltip_data = {
                "race": d.Race,
                "deaths":d.Deaths,
                "rate" : d['Crude Rate']
              }

             // pass this as an argument to the tooltip_render function then,
             // return the HTML content returned from that method.

            return this.tooltip_render(tooltip_data);
        });
        this.svg.call(tip)

    let yScale = d3.scaleLinear()
                    .domain([0, 65])
                    .range([0, this.svgHeight - 30]);

           // Create colorScale
            let colorScale = d3.scaleOrdinal()
                    .domain([0, d3.max(raceData, d => d.Race)])
                    .range([ "#41b6c4", "#238443", "#f9e814", "#c2e699"]);

    // Define the div for the tooltip
     let div = d3.select("#ethnicity").append("div")
         .attr("class", "tooltip")
         .style("opacity", 0);


    let raceRect = this.svg
                    .selectAll('rect')
                    .data(raceData);
      let raceRect_new = raceRect.enter().append('rect').on('mouseover', tip.show).on('mouseout', tip.hide);
      raceRect.exit().remove();
      raceRect = raceRect_new.merge(raceRect);
        raceRect.transition()
                .duration(500)
                .attr('y', 0)
                .attr('x', function(d,i) {
                        return (i*55);
                })
                .attr('width', 40)
                .attr('height', d => {
                  let numdeath = parseInt(d['Crude Rate']);
                  if (isNaN(numdeath)) {
                     return 0;
                   }
                  else return yScale(numdeath);
                })
                .attr('fill', function (d) {
                  return colorScale(d.Race);
                })
                .attr("transform","translate(42,270) scale(1,-1)" );

  }

}
