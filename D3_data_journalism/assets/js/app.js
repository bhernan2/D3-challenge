// @TODO: YOUR CODE HERE!
const svgWidth = 960;
const svgHeight = 500;

const margin = {
    top:20,
    right:40,
    bottom:80,
    left:100
};

var width = svgWidth - margin.left - margin.right;
var height = svgHeight - margin.top - margin.bottom;

//create an svg wrapper, append svg group holding chart, shift latter by left and top margins
const svg = d3
    .select("#scatter")
    .append("svg")
    .attr("width", svgWidth)
    .attr("height", svgHeight + 40);

//append svg group 
const chartGroup = svg.append("g")
    .attr("transform", `translate(${margin.left}, ${margin.top})`);

//initial params
let chosenXaxis = "poverty";
let chosenYaxis = "healthcare";

(async function(){
    //import data
    const stateData = await d3.csv("assets/data/data.csv");
    //parse data/cast as nnumbers
    stateData.forEach(function(data){
        data.poverty = +data.poverty;
        data.healthcare = +data.healthcare;
        data.age = +data.age;
        data.smokes = +data.smokes;
        data.obesity = +data.obesity;
        data.income = +data.income
    });

    //inititalize scale functions
    let xLinearScale = xScale(stateData, chosenXaxis);
    let yLinearScale = yScale(stateData, chosenYaxis);
    //initialize axis functions
    let bottomAxis = d3.axisBottom(xLinearScale);
    let leftAxis = d3.axisLeft(yLinearScale);
    //append x and y axes to chart
    let xAxis = chartGroup.append("g")
        .attr("transform", `translate(0, ${height})`)
        .call(bottomAxis);
    let yAxis=chartGroup.append("g")
        .call(leftAxis);
    //create scatter plot
    
})




