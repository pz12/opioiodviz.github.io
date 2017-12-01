//Highest rate for gender is for West Virginia in 2015; 47.7 for Males and 30.9 for Females
class Gender {

  constructor() {
      this.svgContainerHeight = 320;
      this.genderDiv = d3.select("#gender").attr("height", this.svgContainerHeight);
      this.svgContainerWidth = 250;
      this.bottomSVGPadding = 20;
      this.leftSVGPadding = 20;
      this.topSVGPadding = 10;
      this.bottomGPadding = 10;
      this.leftGPadding = 0;
      this.topGPadding = 0;
      this.svgContainer = this.genderDiv.append("svg");
      this.svgContainer.attr("height", this.svgContainerHeight).attr("width", this.svgContainerWidth);
      this.gContainerWidth = this.svgContainerWidth - this.leftSVGPadding;
      this.gContainerHeight = this.svgContainerHeight - this.bottomSVGPadding - this.topSVGPadding;
      this.gContainer = this.svgContainer.append("g")
          .attr("transform", `translate(${this.leftSVGPadding}, ${this.topSVGPadding})`);

  // .attr('height', this.gContainerHeight)
  //         .attr("width", this.gContainerWidth)




      //Formatting and Scales
      this.maleCenter = (this.gContainerWidth - this.leftGPadding) * .3333;
      this.femaleCenter = (this.gContainerWidth - this.leftGPadding) * .6666;
      this.maxRate = 50.;
      this.rateScale = d3.scaleLinear().domain([50, 0]).range([0, this.gContainerHeight - this.bottomGPadding]);
      this.categoryScale = d3.scaleOrdinal().domain(["Male", "Female"]).range([this.maleCenter, this.femaleCenter]);
      this.maleColor = "steelblue";
      this.femaleColor = "#D63877";
      this.colorScale = d3.scaleOrdinal().domain(["Male", "Female"]).range([this.maleColor, this.femaleColor]);
      this.xAxisGroup = this.gContainer.append("g").attr("transform", `translate(0, ${this.gContainerHeight -5})`);
      this.yAxisGroup = this.gContainer.append("g").attr("transform", `translate(30, 0)`);

      //Bar Formatting
      this.barWidth = 35;

      //Set up the axis
      let yAxis = d3.axisLeft(this.rateScale);
      let xAxis = d3.axisBottom(this.categoryScale);
      this.xAxisGroup.call(xAxis);
      this.yAxisGroup.call(yAxis);
      this.gContainer.selectAll("text").attr("font-size", 18);

      //Remove the axis lines
      // this.xAxisGroup.selectAll("line").remove();
      // this.xAxisGroup.selectAll("path").remove();

      //Add Y-axis label
      // this.yAxisGroup.append("text").text("Deaths per 100k")
      //     .attr("fill", "#000")
      //     .attr("font-size", 17)
      //     .attr("font-weight", 300)
      //     .attr("transform", "translate(18, 60) rotate(-90)")
      //     .attr("text-anchor", "middle");


  }

  /**
     * Renders the HTML content for tool tip.
     *
     * @param tooltip_data information that needs to be populated in the tool tip
     * @return text HTML content for tool tip
     */
    tooltip_render(tooltip_data) {
        let text = "<h2>" + tooltip_data.state + "</h2>";
        text +=  "<div>Deaths: " + tooltip_data.deaths+"</div>";
        text += "<div>Rate per 100,000: " + tooltip_data.rate+"</div>";


        return text;
    }


  update(year, state) {
      let data = datamodel.getData("Gender", state, year);

      //Use this tool tip element to handle any hover over the chart
      let tip = d3.tip().attr('class', 'd3-tip')
          .direction('nw')
          .offset(function() {
              return [0,0];
          })
          .html((d)=>{
            console.log(d)
              // populate data in the following format
              let tooltip_data = {
                  "state": d.Gender,
                  "deaths":d.Deaths,
                  "rate" : d['Crude Rate']
                };

               // pass this as an argument to the tooltip_render function then,
               // return the HTML content returned from that method.

              return this.tooltip_render(tooltip_data);
          });
          this.svgContainer.call(tip)

      let bars = this.gContainer.selectAll("rect").data(data);
      bars.exit().remove();
      bars = bars.enter().append("rect")
        .on('mouseover', tip.show)
        .on('mouseout', tip.hide)
        .merge(bars);
      bars.attr("width", this.barWidth)
          .attr("fill", d=>this.colorScale(d.Gender))
          .attr("y", this.bottomGPadding)
          .attr("x", d =>{return this.categoryScale(d.Gender) - .5 * this.barWidth})
          .attr("transform", `translate(0, ${this.gContainerHeight}) scale(1, -1)`)
          .transition()
          .duration(500)
          .attr("height", d=>{
              let height =  this.rateScale(47.7 - +d["Crude Rate"]);
              if (isNaN(height)){
                  return 0;
              }
              return height;
          });

  }

}
