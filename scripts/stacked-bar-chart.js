console.log(d3)
let width = 850;
let height = 500;

let colorsSchools = [
  "#43481c",
  "#798233",
  "#a0aa5d",
  "#cbd39f",
  "#Eff5cf",
  "#eebec7",
  "#dca4af",
  "#df94a3",
  "#d66982",
  "#E3d0d4"
];

let incLabels = {
  "par_toppt1pc": "Top 0.1%",
  "par_top1pc": "Top 1%",
  "par_top5pc": "Top 5%",
  "par_top10pc": "Top 10%",
  "par_q5": "Top 20%",
  "par_q4": "4th quintile",
  "par_q3": "3rd quintile",
  "par_q2": "2nd quintile",
  "par_q1": "Bottom 20%"
}


let color = d3.scaleOrdinal()
    .domain([
      "Ivy plus",
      "Other elite",
      "Highly selective",
      "Selective",
      "Not selective",
      "Two year or less",
      "For-profit",
      "Not in college",
      "Incomplete"
    ])
    .range(colorsSchools)
    .unknown("#ccc")

let svg = d3.select("body").select("#stacked-bar-chart")
let margin = { top: 0, right: 0, bottom: 30, left: 0 };

d3.csv("data/college-selection-by-income-group-01-13.csv").then(function (data) {
    console.log("loaded")
    console.log({ data })

    data.forEach(d => {
        d.income_group = incLabels[d.income_group]
    })

    console.log({ data })

    let series = d3.stack()
        .keys([
          "Ivy plus",
          "Other elite",
          "Highly selective",
          "Selective",
          "Not selective",
          "Two year or less",
          "For-profit",
          "Not in college",
          "Incomplete"
        ])
        (data)

    console.log({ series })

    let x = d3.scaleLinear()
        .domain([0, 1])
        .range([0, width])

    let y = d3.scaleBand()
        .domain(data.map(d => d["income_group"]).reverse())
        .rangeRound([0, height])
        .paddingInner(0.05)

    let group = svg.append("g")
        .selectAll("g")
        .data(series)
        .join("g")
        .attr("fill", d => color(d.key))

    let bars = group
        .selectAll("rect")
        .data(d => d)
        .join("rect")
        .attr("x", d => x(d[0]))
        .attr("width", d => x(d[1]) - x(d[0]))
        .attr("y", d => y(d.data.income_group))
        .attr("height", y.bandwidth())

    let xTickSettings = d3.axisBottom(x)
        .tickPadding(4)
        .tickSize(0)
        .ticks(11)
        .tickFormat(d3.format(".0%"))

    let xAxis = svg.append("g")
        .attr("class", "x axis")
        .attr("transform", `translate(0,${height})`)
        .call(g => g.selectAll(".domain").remove())
        .call(xTickSettings)

    let yTickSettings = d3.axisLeft(y)
        .tickSize(0)
        .tickPadding(12)

    let yAxis = svg.append("g")
        .attr("class", "y axis")
        .attr("transform", `translate(${margin.left},0)`)
        .call(yTickSettings)

    // Add annotations
    annotate("Ivy plus", 0.03, "top", "light")
    annotate("Elite", 0.22, "top", "light")
    annotate("Highly selective", 0.41, "top", "light")
    annotate("Selective", 0.67, "top", "dark")
    annotate("Not selective", 0.82, "top", "dark")
    annotate("Two-year or less", 0.19, "bottom", "dark")
    annotate("For-profit", 0.33, "bottom", "dark")
    annotate("Not in college by age 22", 0.56, "bottom", "light")
    annotate("Incomplete", 0.92, "bottom", "light")

    function annotate(text, percent, position, colorText) {
      svg.append("text")
        .attr("class", "g-top-label")
        .attr("x", x(percent))
        .attr("y", function() {
          if (position == "top") { return y("Top 0.1% percent"); }
          else if (position == "bottom") { return y("Bottom 20%"); }
        })
        .attr("dy", y.bandwidth() / 2 + 6)
        .attr("dx", percent)
        .text(text)
        .style("fill", function() {
          if (colorText == "dark") { return "#43481c" }
          else if (colorText == "light") { return "white"}
        ;})
        .style("font-size", "14px")
    }
})
