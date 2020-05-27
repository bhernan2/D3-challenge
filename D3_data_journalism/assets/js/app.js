const svgWidth = 960;
const svgHeight = 500;

const margin = {top: 20, right: 40, bottom: 80,  left: 100}; 
 
//dimensions of chart area
const width = svgWidth - margin.left - margin.right;
const height = svgHeight - margin.top - margin.bottom;

//create an SVG wrapper, append an SVG group that will hold chart
const svg = d3
  .select("#scatter")
  .append("svg")
  .classed("chart", true)
  .attr("width", svgWidth)
  .attr("height", svgHeight);

//append an SVG group
const chartGroup = svg.append("g")
  .attr("transform", `translate(${margin.left}, ${margin.top})`);

//initial Params
var chosenXAxis = "poverty";
var chosenYAxis = "healthcare";

//function for updating x-scale const upon click on axis label
function xScale(stateData, chosenXAxis) {
  // create scales
  var xLinearScale = d3.scaleLinear()
    .domain([d3.min(stateData, d => d[chosenXAxis]) * 0.8,
      d3.max(stateData, d => d[chosenXAxis]) * 1.2
    ])
    .range([0, width]);

    return xLinearScale;
}

function yScale (stateData, chosenYAxis) {
     //create scales
     var yLinearScale = d3.scaleLinear()
     .domain([d3.min(stateData, d => d[chosenYAxis]) * 0.8,
         d3.max(stateData, d => d[chosenYAxis]) * 1.2
        ])
     .range([height, 0]);
    return yLinearScale;
}
//function for updating xAxis const upon click on axis label
function renderXAxes(newXScale, xAxis) {
   var bottomAxis = d3.axisBottom(newXScale);

  xAxis.transition()
    .duration(1000)
    .call(bottomAxis);
  return xAxis;
}

function renderYAxes(newYScale, yAxis) {
    var leftAxis = d3.axisLeft(newYScale);

    yAxis.transition()
        .duration(1000)
        .call(leftAxis);
    return yAxis;
}
//retrieve data from the CSV file and execute everything below
(async function () {
    const stateData = await d3.csv("assets/data/data.csv");
    console.log(stateData);
   
//parse data
    stateData.forEach(function(data) {
        data.poverty = +data.poverty;
        data.age = +data.age;
        data.income = +data.income;
        data.healthcare = +data.healthcare;
        data.obesity = +data.obesity;     
        data.smokes = +data.smokes;
    });

//xLinearScale and yLinearScale 
    var xLinearScale = xScale(stateData, chosenXAxis);
    var yLinearScale = yScale(stateData, chosenYAxis);

//create initial axis functions
    var bottomAxis = d3.axisBottom(xLinearScale);
    var leftAxis = d3.axisLeft(yLinearScale);

//append x axis
    var xAxis = chartGroup.append("g")
        .classed("x-axis", true)
        .attr("transform", `translate(0, ${height})`)
        .call(bottomAxis);

//append y axis
    var yAxis = chartGroup.append("g")
        .classed("y-axis", true)
        .call(leftAxis);

    var circlesGroup = chartGroup
        .selectAll("circle")
        .data(stateData)
        .enter()
        .append("circle")
        .attr("class", "stateCircle")
        .attr("r", 18)
        .attr("cx", d => xLinearScale(d[chosenXAxis]))
        .attr("cy", d => yLinearScale(d[chosenYAxis]))
        .attr("fill", "blue")
        .attr("opacity", "0.5");
      
    var circlesText = chartGroup
        .selectAll(".stateText")
        .data(stateData)
        .enter()
        .append("text")
        .attr("x", d => xLinearScale(d[chosenXAxis]))
        .attr("y", d => yLinearScale(d[chosenYAxis])+2)
        .text(d => d.abbr)
        .attr("font-size", "9px")
        .attr("fill", "black");
        
    //create group for x-axes labels
    var xlabelsGroup = chartGroup
        .append("g")
        .attr("transform", `translate(${width / 2}, ${height + 20})`);
   
    var povertyLabel = xlabelsGroup.append("text")
        .classed("aText", true)
        .classed("active", true)
        .attr("x", 0)
        .attr("y", 20)
        .attr("value", "poverty") //value to grab for event listener
        .text("In Poverty (%)");

    var ageLabel = xlabelsGroup.append("text")
        .classed("aText", true)
        .classed("inactive", true)
        .attr("x", 0)
        .attr("y", 40)
        .attr("value", "age")
        .text("Age (Median)")

    var incomeLabel = xlabelsGroup.append("text")
        .classed("aText", true)
        .classed("inactive", true)
        .attr("x", 0)
        .attr("y", 60)
        .attr("value", "income")
        .text("Household Income (Median)")

    //create group for y-axes labels
    var ylabelsGroup = chartGroup
        .append("g")
        .attr("transform", "rotate(-90)");

    var healthcareLabel = ylabelsGroup.append("text")
        .classed("aText", true)
        .classed("active", true)
        .attr("x", 0 -(height / 2))
        .attr("y", - 40)
        .attr("dy", "1em")
        .attr("value", "healthcare")
        .text("Lacks Healthcare (%)");

    var smokesLabel = ylabelsGroup.append("text")
        .classed("aText", true)
        .classed("inactive", true)
        .attr("x", 0 - (height / 2))
        .attr("y", 0 - 70)
        .attr("dy", "1em")
        .attr("value", "smokes")
        .text("Smokes (%)");

    var obesityLabel = ylabelsGroup.append("text")
        .classed("aText", true)
        .classed("inactive", true)
        .attr("x", 0 - (height / 2))
        .attr("y", 0 - 90)
        .attr("dy", "1em")
        .attr("value", "obesity")
        .text("Obese (%)");

    //updateToolTip function a
    circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);

    //x axis labels event listener
    xlabelsGroup.selectAll("text")
        .on("click", function() {
        // get value of selection
        var value = d3.select(this).attr("value");

        if (value !== chosenXAxis) {
            // replaces chosenXAxis with value
            chosenXAxis = value;
            //update x scale for new data
            xLinearScale = xScale(stateData, chosenXAxis);
            //update x axis with transition
            xAxis = renderXAxes(xLinearScale, xAxis);
            //update circles with new x values
            circlesGroup = renderCircles(circlesGroup, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis);

            circlesText = rendercircleTexts(circlesText, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis);
            //updates tooltips with new info
            circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);

            //changes classes to change bold text
            if (chosenXAxis == "poverty") {
                povertyLabel
                    .classed("active", true)
                    .classed("inactive", false);
                ageLabel
                    .classed("active", false)
                    .classed("inactive", true);
                incomeLabel
                    .classed("active", false)
                    .classed("inactive", true);
            }
            else if (chosenXAxis == "age") {
                povertyLabel
                    .classed("active", false)
                    .classed("inactive", true);
                ageLabel
                    .classed("active", true)
                    .classed("inactive", false);
                incomeLabel
                    .classed("active", false)
                    .classed("inactive", true);
            }
            else {
                povertyLabel
                    .classed("active", false)
                    .classed("inactive", true);
                ageLabel
                    .classed("active", false)
                    .classed("inactive", true);
                incomeLabel
                    .classed("active", true)
                    .classed("inactive", false);
            }
        }
     });
//yaxis label event listener
    ylabelsGroup.selectAll("text")
     .on("click", function() {
        //get value of selection
        var value = d3.select(this).attr("value");

        //check if value is same as current axis
        if (value !== chosenYAxis) {

        //replace chosenYAxis with value
            chosenYAxis = value;
            //console.log(chosenYAxis)
        //update y scale for new data
            yLinearScale = yScale(stateData, chosenYAxis);

        //update x axis with transition
            yAxis = renderYAxes(yLinearScale, yAxis);

        //update circles with new y values
        circlesGroup = renderCircles(circlesGroup, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis);

        //update text with new y values
        circlesText = rendercircleTexts(circlesText, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis);

        circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);

    //change classes to change bold text
        if (chosenYAxis == "healthcare") {
        healthcareLabel
            .classed("active", true)
            .classed("inactive", false);
        obesityLabel
            .classed("active", false)
            .classed("inactive", true);
        smokesLabel
            .classed("active", false)
            .classed("inactive", true);
        }
    
    else if (chosenYAxis == "obesity") {
        healthcareLabel
            .classed("active", false)
            .classed("inactive", true);
        obesityLabel
            .classed("active", true)
            .classed("inactive", false);
        incomeLabel
            .classed("active", false)
            .classed("inactive", true);
            }
    else {
        healthcareLabel
            .classed("active", false)
            .classed("inactive", true);
        obesityLabel
            .classed("active", false)
            .classed("inactive", true);
        smokesLabel
            .classed("active", true)
            .classed("inactive", false);
            }
        }
    });

})();