<template>
  <svg :view-box.camel="viewBox" preserveAspectRatio="xMidYMid meet">
    <g class="axes">
      <g class="bottom axis" ref="bottomAxis" :transform="`translate(${xStart},${yStart})`"></g>
      <g class="left axis" ref="leftAxis" :transform="`translate(${xStart},${yEnd})`"></g>
    </g>
    <defs>
      <clipPath id="body-clip">
        <rect
          :x="0-padding"
          y="0"
          :width="quadrantWidth+2*padding"
          :height="quadrantHeight+2*padding"
        ></rect>
      </clipPath>
    </defs>
    <g class="body" :transform="`translate(${xStart},${yEnd})`" clip-path="url(#body-clip)">
      <template v-for="(s,i) in data">
        <path :key="i" class="line" :style="{stroke:colorScale(i)}" :d="line(s)"></path>
        <template v-for="(d,j) in s">
          <circle
            :key="`${i}-${j}`"
            :class="`dot _${j}`"
            :style="{stroke:colorScale(i)}"
            :cx="xScale(d.x)"
            :cy="yScale(d.y)"
            r="4.5"
          ></circle>
        </template>
      </template>
    </g>
  </svg>
</template>

<script>
import * as d3 from "d3";

export default {
  name: "D3Chart",
  data() {
    return {
      width: 600,
      height: 300,
      margins: { top: 30, left: 30, right: 30, bottom: 30 },
      padding: 5,
      data: []
    };
  },
  props: {
    axes: {
      type: Array,
      default() {
        return ["left", "bottom"];
      },
      validator(v) {
        return !_.difference(v, ["left", "right", "top", "bottom"]).length;
      }
    },
    layout: Object,
    chartData: Array
  },
  mounted() {
    let numberOfSeries = 2,
      numberOfDataPoint = 11;

    for (var i = 0; i < numberOfSeries; ++i) {
      this.data.push(
        d3.range(numberOfDataPoint).map(i => {
          return { x: i, y: Math.random() * 9 };
        })
      );
    }
    this.renderAxes();
  },
  watch: {
    // Watch for layout changes
    // layout: {
    //   deep: true,
    //   handler(val, oldVal) {
    //     this.scale.x = this.getScaleX();
    //     this.scale.y = this.getScaleY();
    //     this.draw();
    //   }
    // },
    // chartData: {
    //   deep: true,
    //   handler(val, oldVal) {
    //     this.scale.x = this.getScaleX();
    //     this.scale.y = this.getScaleY();
    //     this.draw();
    //   }
    // }
  },
  computed: {
    xStart() {
      return this.margins.left;
    },

    yStart() {
      return this.height - this.margins.bottom;
    },

    xEnd() {
      return this.width - this.margins.right;
    },

    yEnd() {
      return this.margins.top;
    },

    xScale() {
      return d3
        .scaleLinear()
        .domain([0, 10])
        .range([0, this.quadrantWidth]);
    },

    colorScale() {
      return d3.scaleOrdinal(d3.schemeCategory10);
    },

    yScale() {
      return d3
        .scaleLinear()
        .domain([0, 10])
        .range([this.quadrantHeight, 0]);
    },

    line() {
      return d3
        .line()
        .x(d => this.xScale(d.x))
        .y(d => this.yScale(d.y));
    },

    viewBox: function() {
      return `0 0 ${this.width} ${this.height}`;
    },

    quadrantWidth() {
      return this.width - this.margins.left - this.margins.right;
    },

    quadrantHeight() {
      return this.height - this.margins.top - this.margins.bottom;
    }
  },
  methods: {
    renderAxes() {
      d3.select(this.$refs.bottomAxis).call(d3.axisBottom().scale(this.xScale));
      d3.select(this.$refs.leftAxis).call(d3.axisLeft().scale(this.yScale));
      this.renderHGridLine();
      this.renderVGridLine();
    },
    renderHGridLine() {
      d3.selectAll("g.left g.tick")
        .append("line")
        .classed("grid-line", true)
        .attr("x1", 0)
        .attr("y1", 0)
        .attr("x2", this.quadrantWidth)
        .attr("y2", 0);
    },

    renderVGridLine() {
      d3.selectAll("g.bottom g.tick")
        .append("line")
        .classed("grid-line", true)
        .attr("x1", 0)
        .attr("y1", 0)
        .attr("x2", 0)
        .attr("y2", -this.quadrantHeight);
    }
  },
  components: {}
};
</script>

<style lang="scss" scoped>
.line {
  fill: none;
  stroke: steelblue;
  stroke-width: 2;
}

.dot {
  fill: #fff;
  stroke: steelblue;
}
</style>

<style lang="scss">
.axis path,
.axis line {
  fill: none;
  stroke: #000;
  shape-rendering: crispEdges;
}

.axis text {
  font: 10px sans-serif;
}

.axis .grid-line {
  stroke: black;
  shape-rendering: crispEdges;
  stroke-opacity: 0.2;
}
</style>
