let selectedDistricts = ["City of Chicago", "Shrewsbury"]
let svgBubbles = d3.select("body").select("#bubble-chart")

// Helper function to wrap long labels
function wrap(text, width) {
  text.each(function () {
      var text = d3.select(this),
          words = text.text().split(/\s+/).reverse(),
          word,
          line = [],
          lineNumber = 0,
          lineHeight = 1.1, // ems
          x = text.attr("x"),
          y = text.attr("y"),
          dy = 0, //parseFloat(text.attr("dy")),
          tspan = text.text(null)
                      .append("tspan")
                      .attr("x", x)
                      .attr("y", y)
                      .attr("dy", dy + "em");
      while (word = words.pop()) {
          line.push(word);
          tspan.text(line.join(" "));
          if (tspan.node().getComputedTextLength() > width) {
              line.pop();
              tspan.text(line.join(" "));
              line = [word];
              tspan = text.append("tspan")
                          .attr("x", x)
                          .attr("y", y)
                          .attr("dy", ++lineNumber * lineHeight + dy + "em")
                          .text(word);
          }
      }
  });
}

d3.csv("data/largest_districts.csv").then(function (data) {

    // console.log(data)

    let margin = { top: 0, right: 0, bottom: 30, left: 0 };

    let x = d3.scaleLinear()
        //.domain(d3.extent(data.map(function (d) { return d.ses })))
        .domain([-4, 3])
        .range([margin.left, width - margin.right])

    let y = d3.scaleLinear()
        .domain(d3.extent(data.map(function (d) { return d.mnav3poolgcs })))
        .range([height - margin.bottom, margin.top])

    let z = d3.scaleSqrt()
        .domain(d3.extent(data.map(function (d) { return d.growth_pctile_for_subgroup })))
        .range([0, 25])

    const annotations = [
        {
          note: {
            label: "",
            title: "Chicago Public Schools"
          },
          color: "#43481c",
          x: x(-1.2862),
          y: y(1.664),
          dy: 100,
          dx: 100
        },
        {
          note: {
            label: "",
            title: "Shrewsbury School District"
          },
          color: "#43481c",
          x: x(1.7546),
          y: y(6.439),
          dy: 20,
          dx: -50
        }
      ]

    let yAxisSettings = d3.axisLeft(y) //set axis to the left
        .ticks(7)
        .tickSize(0)
        .tickSize(-width)
        .tickFormat("")

    let xAxisSettings = d3.axisBottom(x)
        .tickSize(0)
        .tickValues([])

    let bg = svgBubbles.append("rect")
        .attr("x", margin.left)
        .attr("y", 0)
        .attr("width", width)
        .attr("height", height)
        .style("fill", "rgba(0,0,0,0)")

    //adding to the axes to our chart
    let xAxisTicks = svgBubbles.append("g")
        .attr("class", "x axis") //give each axis a class
        .call(xAxisSettings)
        .attr("transform", `translate(0,${height - margin.bottom})`)

    let yAxisTicks = svgBubbles.append("g")
        .attr("class", "y axis")
        .call(yAxisSettings)
        .attr("transform", `translate(${margin.left},0)`)

    let average = svgBubbles.append("line")
        .attr("x1", -margin.left)
        .attr("x2", width + margin.left)
        .attr("y1", y(3))
        .attr("y2", y(3))
        .style("stroke", "#353802")
        .style("stroke-width", "5px")

    let popup = d3.select(".pop-up");
    let shuffled = d3.shuffle(data);

    // Add bubbles
    let bubbles = svgBubbles.append("g")
       .selectAll("dot")
       .data(shuffled.filter(d => !isNaN(d.ses)))
       .enter()
       .append("circle")
          .attr("class", function (d) { return "points p-" + d.leaidC } )
          .attr("cx", function (d) { return x(d.ses); } )
          .attr("cy", function (d) { return y(d.mnav3poolgcs); } )
          .attr("r", function (d) { return z(d.growth_pctile_for_subgroup); } )
          .style("fill", "#df94a3")
          .style("opacity", "0.2")
          .style("stroke", "#d66982")

    // Pop-ups!
    // bubbles.on("mouseover", (event, d) => {
    //   // bubbles
    //   //   .style("stroke", "#d66982")
    //   //   .style("stroke-width", .5)
    //   //   .style("fill", "#df94a3")
    //   //   .style("fill-opacity", .25)
    //   //   .raise()
    //
    //   svgBubbles.select(".p-" + d.leaidC)
    //     .style("stroke", "#43481c")
    //     .style("stroke-width", 2)
    //     .style("fill", "#a0aa5d")
    //     .style("fill-opacity", 1)
    //     .raise()
    //
    //   let rescaleLang = d3.scaleThreshold()
    //     .domain([0])
    //     .range(["below", "above"])
    //
    //   let diff = +d.mnav3poolgcs - 3
    //
    //   let lang = "In " + d.newname + ", " + d.nyt_abbrev + " the typical 3rd grade student scored "
    //   lang += d3.format(".1f")(Math.abs(diff)) + " years " + rescaleLang(diff) + " their grade level."
    //
    //   popup
    //     .style("opacity", 1)
    //     .style("left", (event.x - 100) + "px")
    //     .style("top", (event.y -100) + "px")
    //     .html(lang)
    //
    // })
    //
    // bubbles.on("mouseout", (event, d) => {
    //   bubbles
    //     .style("stroke", "#d66982")
    //     .style("stroke-width", .5)
    //     .style("fill", "#df94a3")
    //     .style("fill-opacity", .25)
    //
    //   popup
    //     .style("opacity", 0)
    // })

    let highlights = svgBubbles.append("g")
      .selectAll("dot")
      .data(data.filter(d => selectedDistricts.includes(d.newname)))
      .enter()
      .append("circle")
         .attr("cx", function (d) { return x(d.ses); } )
         .attr("cy", function (d) { return y(d.mnav3poolgcs); } )
         .attr("r", function (d) { return z(d.growth_pctile_for_subgroup); } )
         .style("fill", "#a0aa5d")
         .style("opacity", "1")
         .attr("stroke", "#43481c")

    let xaxis_annotation_poor = svgBubbles.append("text")
      .attr("text-anchor", "start")
      .attr("x", margin.left)
      .attr("y", height / 2 + 10)
      .text("Poorer districts")
      .style("font-size", "14px")
      .style("opacity", 0.5)

    let xaxis_annotation_rich = svgBubbles.append("text")
      .attr("text-anchor", "end")
      .attr("x", width + margin.left)
      .attr("y", height / 2 + 10)
      .text("Richer districts")
      .style("font-size", "14px")
      .style("opacity", 0.5)

    let two_yrs_behind = svgBubbles.append("text")
      .attr("text-anchor", "start")
      .attr("x", width + margin.left + 20)
      .attr("y", height - 57)
      .text("2 years behind")
      .style("font-size", "14px")
      .style("opacity", 0.5)

    let one_yr_behind = svgBubbles.append("text")
      .attr("text-anchor", "start")
      .attr("x", width + margin.left + 20)
      .attr("y", height - 57 - (1*80))
      .text("1 year behind")
      .style("font-size", "14px")
      .style("opacity", 0.5)

    let average_scores = svgBubbles.append("text")
      .attr("text-anchor", "start")
      .attr("x", width + margin.left + 20)
      .attr("y", height - 57 - (2*80))
      .style("font-weight", "bold")
      .text("AVERAGE")
      .style("font-size", "14px")
      .style("opacity", 0.5)

    let one_yr_ahead = svgBubbles.append("text")
      .attr("text-anchor", "start")
      .attr("x", width + margin.left + 20)
      .attr("y", height - 57 - (3*80))
      .text("1 year ahead")
      .style("font-size", "14px")
      .style("opacity", 0.5)

    let two_yrs_ahead = svgBubbles.append("text")
      .attr("text-anchor", "start")
      .attr("x", width + margin.left + 20)
      .attr("y", height - 57 - (4*80))
      .text("2 years ahead")
      .style("font-size", "14px")
      .style("opacity", 0.5)

    let three_yrs_ahead = svgBubbles.append("text")
      .attr("text-anchor", "start")
      .attr("x", width + margin.left + 20)
      .attr("y", height - 57 - (5*80))
      .text("3 years ahead")
      .style("font-size", "14px")
      .style("opacity", 0.5)

    const makeAnnotations = d3.annotation()
      .annotations(annotations)

    let annotation = svgBubbles.append("g")
      .call(makeAnnotations)

})
