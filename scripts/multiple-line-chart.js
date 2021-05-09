let svgMultipleLine = d3.select("body").select("#multiple-line-chart")

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

d3.csv("data/time_series_90s_d3_13_15_averaged_july_22.csv")
  .then(function (data) {

    console.log(data)

    let margin = { top: 0, right: 0, bottom: 30, left: 0 };

    let x = d3.scaleLinear()
        .domain([-13, 10])
        // .domain(d3.extent(data.map(function (d) { return d.generation }))) //d3 extent
        .range([margin.left, width - margin.right])

    let y = d3.scaleLinear()
        .domain(d3.extent(data.map(function (d) { return d.recognition })))
        .range([height - margin.bottom, margin.top])

    let yAxisSettings = d3.axisLeft(y)
        .ticks(5)
        .tickSize(-width)
        .tickFormat(d3.format(".0%"))
        .tickPadding(10)

    let xAxisSettings = d3.axisBottom(x)
        .ticks(10)
        .tickSize(0)
        .tickPadding(10)
        .tickValues(["-9", "-6", "-3", "3", "6"])
        .tickFormat(function(d) {
          if (d < 0) return -d;
          else return d;
        })

    let bg = svgMultipleLine.append("rect")
        .attr("x", margin.left)
        .attr("y", 0)
        .attr("width", width)
        .attr("height", height)
        .style("fill", "rgba(0,0,0,0)")

    let xAxisTicks = svgMultipleLine.append("g")
        .attr("class", "x axis")
        .call(xAxisSettings)
        .attr("transform", `translate(0,${height - margin.bottom})`)

    let yAxisTicks = svgMultipleLine.append("g")
        .attr("class", "y axis")
        .call(yAxisSettings)
        .attr("transform", `translate(${margin.left},0)`)

    let line = d3.line()
        .defined(d => !isNaN(d.recognition))
        .x(function (d) { return x(d.generation) })
        .y(function (d) { return y(d.recognition) })
        .curve(d3.curveMonotoneX)

    // Clean up the data
    let filteredSongs = data
      .filter(function(d) { return (d.recognition > 0.9 & d.generation <= -13) })

    let groupedData = d3.group(filteredSongs, d => d.artist_song);

    let toKeep = Array.from(groupedData.keys());

    let chartData = d3.group(
      data
        .filter(function(d) { return toKeep.includes(d.artist_song) && d.recognition > 0 }),
      d => d.artist_song)

    console.log(chartData)

    let release_year = svgMultipleLine.append("line")
      .attr("x1", x(0))
      .attr("x2", x(0))
      .attr("y1", height - margin.bottom)
      .attr("y2", margin.top)
      .style("stroke", "#353802")
      .style("stroke-width", "2px")
      .style("stroke-opacity", "0.5")

    let line_path = svgMultipleLine.append("g")
      .selectAll(".line")
      .data(chartData)
      .join("path")
      .attr("class", function(d) {
          return "line " +  d[0]
      })
      .attr("d", function(d) {
          return line(d[1])
      })
      .style("stroke", d => {
          if(d[0] == "Toni Braxton|||Un-Break My Heart") {
              return "#d66982"
          } else {
              return "#df94a3"
          }
      })
      .style("stroke-width", d => {
          if(d[0] == "Toni Braxton|||Un-Break My Heart") {
              return "3px"
          } else {
              return "0.5px"
          }
      })
      .style("stroke-opacity", d => {
          if(d[0] == "Toni Braxton|||Un-Break My Heart") {
              return "1"
          } else {
              return "0.5"
          }
      })
      .style("fill", "none")

    let baseline = svgMultipleLine.append("line")
      .attr("x1", margin.left)
      .attr("x2", width + margin.left)
      .attr("y1", y(0))
      .attr("y2", y(0))
      .style("stroke", "#7e7e7e")
      .style("stroke-width", "2px")

    // Y axis label:
    let yaxis_title = svgMultipleLine.append("text")
      .attr("text-anchor", "end")
      .attr("transform", "rotate(0)")
      .attr("y", -margin.left - 25)
      .attr("x", -margin.top + 200)
      .style("font-size", "14px")
      .style("fill", "#7e7e7e")
      .text("Percent of people who know song")

    // Y axis label:
    let xaxis_title = svgMultipleLine.append("text")
      .attr("text-anchor", "middle")
      .attr("x", width * 0.575)
      .attr("y", height + margin.top + 25)
      .style("font-size", "14px")
      .style("fill", "#7e7e7e")
      .text("Age in year that song was released")

    // Annotate the x-axis
    let xaxis_annotation0 = svgMultipleLine.append("text")
      .attr("text-anchor", "middle")
      .attr("x", width * 0.575)
      .attr("y", height - 10)
      .attr("background", "#eee7f5")
      .style("font-size", "12px")
      .text("Born year of song release")
      .call(wrap, 90)

    let xaxis_annotation10 = svgMultipleLine.append("text")
      .attr("text-anchor", "middle")
      .attr("x", width)
      .attr("y", height - 10)
      .attr("background", "#eee7f5")
      .style("font-size", "12px")
      .text("10 years until born")
      .call(wrap, 90)

    let xaxis_annotation12 = svgMultipleLine.append("text")
      .attr("text-anchor", "middle")
      .attr("x", 70)
      .attr("y", height - 10)
      .style("font-size", "12px")
      .text("12 years old")
      .call(wrap, 90)

    let song_anotation = svgMultipleLine.append("text")
      .attr("text-anchor", "middle")
      .attr("x", 720)
      .attr("y", 250)
      .style("fill", "#d66982")
      .style("font-size", "14px")
      .style("font-weight", "bold")
      .text("Unbreak My Heart (Toni Braxton)")

    // Add annotation to the chart
    let born_after = svgMultipleLine.append("text")
      .attr("text-anchor", "middle")
      .attr("x", width * 0.8)
      .attr("y", height - margin.top - 50)
      .style("font-size", "12px")
      .style("font-weight", "bold")
      .style("fill", "#353802")
      .text("BORN AFTER SONG RELEASE")


})
