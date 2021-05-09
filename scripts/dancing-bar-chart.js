let svgDancingBar = d3.select("body").select("#dancing-bar-chart")

d3.csv("data/healthcare-disposable-inc.csv").then(function (data) {
    console.log("loaded")
    console.log(data)

    data.forEach(d => {
      d.Percentile = +d.Percentile
    })

    let margin = { top: 0, right: 0, bottom: 30, left: 0 };

    let sel_cols = [
    "Medicaid",
    "Medicare",
    "Medicare+Medicaid",
    "Employer",
    "Uninsured",
    "Direct Purchase",
    "Subsidized Exchange",
    "CHIP",
    "Military",
    "Other"
    ]

    // let sel_colors = [
    // "#F44336", // "Medicaid",
    // "#FF9800", // "Medicare",
    // "#FDD835", // "Medicaid+Medicare",
    // "#FFF8E1", // "Employer",
    // "#26A69A", // "Uninsured",
    // "#4DD0E1", // "Direct Purchase",
    // "#F06292", // "Subsidized Exchange",
    // "#5C6BC0", // "CHIP",
    // "#90A4AE", // "Military",
    // "#E0E0E0" // "Other"
    // ]

    let sel_colors = [
    "#43481c",
    "#798233",
    "#a0aa5d",
    "#cbd39f",
    "#Eff5cf",
    "#eebec7",
    "#dca4af",
    "#df94a3",
    "#d66982",
    "#E0E0E0"
    ]

    let year_state = 2009;
    let d2020 = data.filter(d => d.year == 2020)
    let d2009 = data.filter(d => d.year == 2009)

    let series = d3.stack().keys(sel_cols)(d2009);
    console.log(series)

    let color = d3.scaleOrdinal()
        .domain(sel_cols)
        .range(sel_colors)

    let x = d3.scaleLinear()
        .domain([0, 100])
        .range([margin.left, width])

    let y = d3.scaleLinear()
        .domain([0, 1])
        .range([height - margin.bottom, margin.top])

    let area = d3.area()
        .x(d => x(d.data.Percentile))
        .y0(d => y(d[0]))
        .y1(d => y(d[1]))

    let xAxisSettings = d3.axisBottom(x)
        .tickSize(6)
        .tickPadding(6)
        .ticks(10)
        .tickFormat(d3.format(".0f"))
        .tickValues([5, 10, 20, 30, 40, 50, 60, 70, 80, 90, 95])

    let xAxisTicks = svgDancingBar.append("g")
        .attr("class", "x axis")
        .call(xAxisSettings)
        .call(g => g.selectAll(".domain").remove())
        .attr("transform", `translate(0,${height - margin.bottom})`)

    let yAxisSettings = d3.axisLeft(y)
        .tickValues([.2, .4, .6, .8])
        .tickSize(0)
        .tickPadding(4)
        .tickFormat(d3.format(".0%"))

    let yAxisTicks = svgDancingBar
        .append("g")
        .attr("class", "y axis")
        .call(yAxisSettings)
        .call(g => g.selectAll(".domain").remove())

    let hed = d3.select(".hed")

  // Area chart
    let areaChart = svgDancingBar.append("g")

    areaChart
      .selectAll("path")
      .data(series)
      .join("path")
      .attr("class", d => d.key)
      .attr("fill", d => color(d.key))
      .attr("d", area)

  function update() {
      console.log("update")
      console.log("old year state " + year_state);

      if (year_state == "2020") {
          year_state = "2009"
          dance(d2009)
          hed.html("American health insurance by income in <span class=highlightpink>2009</span>")

      } else {
          year_state = "2020"
          dance(d2020)
          hed.html("American health insurance by income in <span class=highlightpink>2020</span>")

      }
      console.log("new year state " + year_state);
  }

  function dance(new_data) {
    new_series = d3.stack()
      .keys(sel_cols)
      (new_data);

    areaChart
      .selectAll("path")
      .data(new_series)
      .join("path")
      .attr("class", d => d.key)
      .transition()
      .duration(500)
      .ease(d3.easeLinear)
      .attr("fill", d => color(d.key))
      .attr("d", area)
  }

  var timer = d3.interval(update, 3000) //in milliseconds

  // Annotations
   svgDancingBar.append("text")
      .attr("class", "label")
      .attr("x", 600)
      .attr("y", 250)
      .text("Employer")

   svgDancingBar.append("text")
      .attr("class", "label")
      .attr("x", 75)
      .attr("y", 430)
      .text("Medicaid")
      .style("fill", "white")

    svgDancingBar.append("text")
      .attr("class", "label")
      .attr("x", 75)
      .attr("y", 295)
      .text("Medicare")
      .style("fill", "white")

    svgDancingBar.append("text")
      .attr("class", "label")
      .attr("x", 75)
      .attr("y", 75)
      .text("Uninsured")
      .style("fill", "#43481c")

    svgDancingBar.append("text")
      .attr("class", "axis-label")
      .attr("x", width / 2)
      .attr("y", height + 15)
      .text("Income percentile")
      .attr("text-anchor", "middle")
      .style("font-size", "14px")
      .style("opacity", 0.5)

    svgDancingBar.append("text")
      .attr("class", "axis-label")
      .attr("x", width - 30)
      .attr("y", height + 15)
      .text("Higher income")
      .attr("text-anchor", "middle")
      .style("font-size", "14px")
      .style("opacity", 0.5)

    svgDancingBar.append("text")
      .attr("class", "axis-label")
      .attr("x", margin.left)
      .attr("y", height + 15)
      .text("Lower income")
      .attr("text-anchor", "start")
      .style("font-size", "14px")
      .style("opacity", 0.5)

})
