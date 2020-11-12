///////////////////////////////////////////////////////////////////////////
//////////////////////////// libs /////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////

// import * as d3 from "d3";
// import { csv } from "d3-fetch";
// import _ from "lodash";

console.clear();

///////////////////////////////////////////////////////////////////////////
//////////////////////////// drawing function /////////////////////////////
///////////////////////////////////////////////////////////////////////////

const createChart = async () => {
	//////////////////////////// data /////////////////////////////////////////

	let data = [
		{ title: "proxy", val: 7 },
		{ title: "state", val: 6 },
		{ title: "state and proxy", val: 7 }
	];

	//////////////////////////// accessors ////////////////////////////////////

	const col = "title";
	// const xAccessor = (d) => d.startYear;
	const cAccessor = (d) => d[col];
	const rAccessor = (d) => d.val;

	//////////////////////////// svg ///////////////////////////////////

	const wrapper = d3.select("#appProxies").append("svg");

	// if element already exists, return selection
	// if it doesn't exist, create it and give it class
	const selectOrCreate = (elementType, className, parent) => {
		const selection = parent.select("." + className);
		if (!selection.empty()) return selection;
		return parent.append(elementType).attr("class", className);
	};

	///////////////////////////////////////////////////////////////////////////
	//////////////////////////// update function /////////////////////////////
	///////////////////////////////////////////////////////////////////////////
	const update = () => {
		//////////////////////////// sizes ///////////////////////////////////
		const el = document.getElementById("col");
		// const size = 795;
		// const size = d3.min([window.innerWidth * 0.99, window.innerHeight * 0.99]);
		const size = el.clientWidth * 0.99;

		let dimensions = {
			width: size,
			height: size * 0.5,
			margin: {
				top: 15,
				right: 15,
				bottom: 60,
				left: 60
			}
		};

		dimensions.boundedWidth =
			dimensions.width - dimensions.margin.left - dimensions.margin.right;
		dimensions.boundedHeight =
			dimensions.height - dimensions.margin.top - dimensions.margin.bottom;

		var nodePadding = 5;

		//////////////////////////// svg ///////////////////////////////////

		// tag = name; class = .name; id = #name;
		wrapper.attr("width", dimensions.width).attr("height", dimensions.height);

		// shifting
		const bounds = selectOrCreate("g", "wrapper", wrapper).style(
			"transform",
			`translate(${dimensions.margin.left}px,${dimensions.margin.top}px)`
		);

		//////////////////////////// colors ///////////////////////////////////////

		const colorsType = [
			// "#113655",
			"#f28c00",
			// "#3f8ca5"
			"#fed061",
			// "#99d4e3",
			"#fab85f"
		];

		//////////////////////////// scales ///////////////////////////////////////

		const rScale = d3
			.scaleSqrt()
			// .domain(d3.extent(data, rAccessor))
			.domain([0, d3.max(data, rAccessor)])
			.range([10, dimensions.boundedHeight / 5]);

		const cScale = d3
			.scaleOrdinal()
			.domain(["proxy", "state", "state and proxy"])
			.range(colorsType);

		///////////////////////////////////////////////////////////////////////////
		//////////////////////////// plot /////////////////////////////////////////
		///////////////////////////////////////////////////////////////////////////

		const dots = (data) => {
			const tooltip = selectOrCreate(
				"div",
				"tooltip",
				d3.select("#appProxies")
			);

			const dots = bounds
				.selectAll(".nodes")
				.data(data)
				.enter()
				.append("g")
				.classed("nodes", true);

			dots
				.append("circle")
				.attr("r", (d) => rScale(rAccessor(d)))
				.style("opacity", 1);

			dots
				.style("fill", (d) => cScale(cAccessor(d)))
				.style("fill-opacity", 0.1)
				.attr("stroke", (d) => cScale(cAccessor(d)));

			const label = bounds
				.selectAll(".label")
				.data(data)
				.enter()
				.append("text")
				.classed("label", true)
				.attr("x", (d) => d.x)
				.attr("y", (d) => d.y)
				.text((d) => d.title);

			// tooltip
			dots.on("mouseover", (event, d) => {
				var mouseX = event.pageX + 5;
				var mouseY = event.pageY + 5;
				d3.select(".tooltip")
					.style("visibility", "visible")
					.style("opacity", 1)
					.style("left", mouseX + "px")
					.style("top", mouseY + "px")
					.html("<u>" + d.title + "</u>" + "<br>" + d.value);
				// smoother change in opacity
				dots.transition().style("opacity", 0.25);
			});

			dots.on("mousemove", (d, i) => {
				var mouseX = event.pageX + 5;
				var mouseY = event.pageY + 5;
				d3.select(".tooltip")
					.style("left", mouseX + "px")
					.style("top", mouseY + "px")
					.html("<b>" + d.title + "</b>" + "<br>" + d.val + " cases");
			});

			dots.on("mouseleave", function (d) {
				d3.select(".tooltip").style("visibility", "hidden");
				dots.transition().style("opacity", 1);
			});

			//////////////////////////// force ///////////////////////////////////////

			var simulation = d3
				.forceSimulation()
				.force(
					"center",
					d3
						.forceCenter()
						.x(dimensions.boundedWidth / 2)
						.y(dimensions.boundedHeight / 2)
				)
				.force("charge", d3.forceManyBody().strength(0.1))
				.force(
					"collide",
					d3
						.forceCollide()
						.strength(0.05)
						.radius((d) => rScale(rAccessor(d) + nodePadding))
						.iterations(1)
				);
			// .stop();

			simulation.nodes(data).on("tick", (d) => {
				// dot x and y pos
				dots.attr("transform", function (d) {
					return "translate(" + d.x + ", " + d.y + ")";
				});
				// label x and y pos
				label.attr("transform", function (d) {
					return "translate(" + d.x + ", " + d.y + ")";
				});
			});
		};
		dots(data);
	};

	update();
};

createChart();
