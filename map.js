"use strict";

(function () {
    //// main variables
    let GeoJSONObject = null;
    let colorScale = null;
    const tooltip = d3.select("body").append("div")	
            .style("position", "absolute")
            .style("text-align", "center")
            .style("font-size", "10px")
            .style("font-family", "Arial")			
            .style("display", "none");

    //// draw basic map
    const width = d3.select("#svg_map").attr("width"),
    height = d3.select("#svg_map").attr("height");
    
    const svg = d3.select("#svg_map")
        .append("g");

    svg.append("rect")
        .attr("x", 0).attr("y", 0)
        .attr("width", width).attr("height", height)
        .attr("fill", "lightblue"); //color the oceans

    const map = svg.append("g")
        .attr("class", "map")

    //// load data
    get_country_geoJSON().then(function(geoJSON) {
        GeoJSONObject = geoJSON;
        get_data().then(function(dataset) {
            //// color scale 
            colorScale = d3.scaleLog()
                .domain([1, d3.max(dataset, function(d) { return d3.max(d.data, function(v) { return v.counts; }); })])
                .range([0, 1]);
            drawLegend();

            //// bind daterange onchange event
            document.getElementById("dateRange").onchange = function(){
                const date_selected = d3.timeFormat("%Y-%m-%d")(d3.timeDay.offset(new Date(2020, 2, 29), this.value));
                const data_selected = dataset.filter(function(d) { return d.date === date_selected; })[0];
                draw_countries(data_selected.data, data_selected.date);
            };

            //// run visualization
            for (let i = 0; i < 33; i++) {
                setTimeout(function () {
                    document.getElementById("dateRange").value = i;
                    var event = new Event('change');
                    document.getElementById("dateRange").dispatchEvent(event);
                }, i * 200);
            }
        });
    });

    //// function definitions
    async function get_data() {
        const dataset = await d3.json("counts.json");
        d3.select("#loading").style("display", "none");
        return dataset;
    }

    async function get_country_geoJSON() {
        const countries = await d3.csv("Countries.CSV");
        const topology = await d3.json("https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json");
        const GeoJSONObject = topojson.feature(topology, topology.objects.countries);
        for (let i = 0; i < GeoJSONObject.features.length; i++) {
            const country_found = countries.filter(function(d) { 
                return d.numeric_country_code === GeoJSONObject.features[i].id 
            });
            if (country_found.length)
                GeoJSONObject.features[i].country_code = country_found[0].country_code;
        }
        return GeoJSONObject;
    }

    function draw_countries(data, date) {    
        d3.select("#current_date").text(d3.timeFormat("%B %e, %Y")(d3.timeParse("%Y-%m-%d")(date)));

        //sphere to plane projection, fit to svg size
        const project = d3.geoEquirectangular()
            .fitSize([width, height], GeoJSONObject);

        //plot map of countries
        map.append("g")
            .attr("class", "map")
            .selectAll(".country")
            .data(GeoJSONObject.features)
            .enter().append("path")
                .attr("class", "country")
                .attr("d", d3.geoPath().projection(project))
                .attr("stroke", "transparent")
                .attr("fill", function(d) {
                    const count_data = data.filter(function(v) { return v.country_code == d.country_code; });
                    if (count_data.length)
                        return d3.interpolateOrRd(colorScale(count_data[0].counts));
                    return "white";
                });

        //tooltips
        map.selectAll("path")
            .on("mousemove", function(event, d) {
                tooltip.style("display", "block");	
                const count_data = data.filter(function(v) { return v.country_code == d.country_code; });
                tooltip.html("<b>" + d.properties.name + "</b><br/>"
                        + "Number of COVID-19 tweets: " + (count_data.length ? count_data[0].counts : "0")  )
                    .style("left", (event.pageX - 80) + "px")		
                    .style("top", (event.pageY - 30) + "px");	
            }).on("mouseout", function() {		
                tooltip.style("display", "none");	
            });
    }

    function drawLegend() {
        const tickSize = 6;
        const legendWidth = 200, legendHeight = 30;
        let tickAdjust = g => g.selectAll(".tick line").attr("y1",  10 + tickSize - legendHeight);
    
        const x = colorScale.copy().rangeRound(d3.quantize(d3.interpolate(0, legendWidth), 2));
        
        const canvas = document.createElement("canvas");
        const context = canvas.getContext("2d");
        const x_domain = colorScale.copy().domain([1, 2]);
        for (let i = 0; i < 256; ++i) {
            context.fillStyle = d3.interpolateOrRd(x_domain(i / (256 - 1) + 1));
            context.fillRect(i, 0, 1000, 1000);
        }

        const legend = svg.append("g")
            .attr("class", "legend")
            .attr("transform", "translate(" + (width - legendWidth - 10) + "," + (height - legendHeight - 50) + ")");
        
        legend.append("image")
            .attr("x", 0)
            .attr("y", 15)
            .attr("width", legendWidth )
            .attr("height", legendHeight - 8 )
            .attr("preserveAspectRatio", "none")
            .attr("xlink:href", canvas.toDataURL());

        legend.append("g")
            .attr("transform", "translate(0," + legendHeight + ")")
            .call(d3.axisBottom(x)
            .ticks(legendWidth / 64)
            .tickFormat(d3.format(","))
            .tickSize(tickSize))
                .call(tickAdjust)
                .call(function(g) { return g.select(".domain").remove(); })
                .append("text")
                    .attr("x", 0)
                    .attr("y", 18 - legendHeight - tickSize)
                    .attr("fill", "black")
                    .attr("text-anchor", "start")
                    .style("font-size", "10px")
                    .attr("class", "title")
                    .text("Number of tweets with Covid-19 hashtags");
    }

})();


