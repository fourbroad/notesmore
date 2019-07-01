<template>
  <svg
    :view-box.camel="viewBox"
    preserveAspectRatio="xMidYMid meet"
    shape-rendering="geometricPrecision"
  >
    <g class="axes">
      <g
        class="top axis"
        v-if="show('top')"
        ref="topAxis"
        :transform="`translate(${xStart},${yEnd})`"
      />
      <g
        class="right axis"
        v-if="show('right')"
        ref="rightAxis"
        :transform="`translate(${xEnd},${yEnd})`"
      />
      <g
        class="bottom axis"
        v-if="show('bottom')"
        ref="bottomAxis"
        :transform="`translate(${xStart},${yStart})`"
      />
      <g
        class="left axis"
        v-if="show('left')"
        ref="leftAxis"
        :transform="`translate(${xStart},${yEnd})`"
      />
    </g>
    <g class="legend" :transform="`translate(${legend.x},${legend.y})`">
      <template v-for="(s,i) in data">
        <g :key="`legend-${i}`" class="legend-item" :transform="`translate(0,${i*12})`">
          <rect width="10" height="10" :fill="scaleColor(i)" />
          <text x="15" y="10">{{metrics[i].label}}</text>
        </g>
      </template>
    </g>
    <g class="labels">
      <text
        v-if="labelLeft"
        :transform="`translate(10,${height/2}),rotate(-90)`"
        class="axis-label left-axis-label"
        text-anchor="middle"
      >{{labelLeft}}</text>
      <text
        v-if="labelRight"
        :transform="`translate(${width-10},${height/2}),rotate(90)`"
        class="axis-label right-axis-label"
        text-anchor="middle"
      >{{labelRight}}</text>
      <text
        v-if="labelBottom"
        :transform="`translate(${width/2},${height})`"
        class="axis-label bottom-axis-label"
        text-anchor="middle"
      >{{labelBottom}}</text>
      <text
        v-if="labelTop"
        :transform="`translate(${width/2},${10})`"
        class="axis-label top-axis-label"
        text-anchor="middle"
      >{{labelTop}}</text>
    </g>
    <defs>
      <clipPath id="body-clip">
        <rect
          :x="0-padding"
          :y="0-padding"
          :width="quadrantWidth+2*padding"
          :height="quadrantHeight+2*padding"
        />
      </clipPath>
    </defs>
    <g class="body" :transform="`translate(${xStart},${yEnd})`" clip-path="url(#body-clip)">
      <template v-for="(m, i) in barMetrics">
        <linearGradient
          :key="`bar-lg-${m.index}`"
          :id="`bar-lg-${m.index}`"
          x1="0%"
          y1="0%"
          x2="0%"
          y2="100%"
        >
          <stop offset="0%" :style="{'stop-color':scaleColor(m.index),'stop-opacity':0.6}" />
          <stop offset="100%" :style="{'stop-color':scaleColor(m.index),'stop-opacity':0.9}" />
        </linearGradient>
        <template v-for="(d,j) in data[m.index]">
          <rect
            :key="`bar-${m.index}-${j}`"
            class="bar"
            :width="barWidth"
            :style="{stroke:scaleColor(m.index)}"
            :fill="`url(#bar-lg-${m.index})`"
            :height="scaleMetric(m, d)"
            :x="scaleDimension(m,d)-(barWidth*barMetrics.length)/2 + i*barWidth"
            :y="yStart-scaleMetric(m,d)-margins.top"
            @click="select"
            data-toggle="tooltip"
            data-placement="top"
            :title="`${m.label}:${scaleMetric(m, d)}`"
          />
        </template>
      </template>
      <template v-for="m in lineMetrics">
        <path
          :key="`line-${m.index}`"
          class="line"
          :style="{stroke:scaleColor(m.index)}"
          :d="line(m)(data[m.index])"
        />
        <template v-for="(d,i) in data[m.index]">
          <circle
            :key="`dot-${m.index}-${i}`"
            class="dot"
            :style="{stroke:scaleColor(m.index)}"
            :fill="scaleColor(m.index)"
            :cx="scaleDimension(m,d)"
            :cy="scaleMetric(m,d)"
            r="3"
            data-toggle="tooltip"
            data-placement="top"
            :title="`${m.label}:${scaleMetric(m, d)}`"
          />
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
    return {};
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
    width: {
      type: Number,
      default() {
        return 600;
      }
    },
    height: {
      type: Number,
      default() {
        return 300;
      }
    },
    margins: {
      type: Object,
      default() {
        return { top: 30, left: 30, right: 30, bottom: 30 };
      }
    },
    padding: {
      type: Number,
      default() {
        return 5;
      }
    },
    legend: {
      type: Object,
      default() {
        return {
          x: 60,
          y: 30
        };
      }
    },
    grid: Boolean,
    data: Array,
    metrics: {
      type: Array,
      default() {
        return [
          {
            label: "A系列",
            metric: {
              scale: "left",
              map: d => d.y
            },
            dimension: {
              scale: "bottom",
              map: d => d.x
            }
          },
          {
            label: "B系列",
            metric: {
              scale: "left",
              map: d => d.y
            },
            dimension: {
              scale: "bottom",
              map: d => d.x
            }
          }
        ];
      }
    },
    scales: {
      type: Object,
      default() {
        return {
          left: {
            name: "scaleLinear",
            label: "Quantity",
            domain: data => [1, 100]
          },
          top: {
            name: "scaleLinear",
            label: "Dimension",
            domain: data => [1, 100]
          },
          bottom: {
            name: "scaleLinear",
            label: "Dimension",
            domain: data => [1, 100]
          },
          right: {
            name: "scaleLinear",
            label: "Quantity",
            domain: data => [1, 100]
          },
          color: d3.schemeCategory10
        };
      }
    }
  },
  mounted() {
    $('[data-toggle="tooltip"]').tooltip();
    this.renderAxes();
  },
  watch: {
    data: {
      deep: true,
      handler(val, oldVal) {
        this.renderAxes();
      }
    }
  },
  computed: {
    barWidth() {
      let maxItem = 0,
        metric = 0,
        start = 0,
        end = this.quadrantWidth;
      this.barMetrics.forEach(m => {
        if (this.data[m.index].length > maxItem) {
          maxItem = this.data[m.index].length;
          metric = m;
        }
      });

      start = this.scaleDimension(metric, this.data[metric.index][0]);
      end = this.scaleDimension(metric, this.data[metric.index][maxItem - 1]);

      return this.barMetrics.length > 0
        ? (end - start - maxItem * this.barMetrics.length) /
            (maxItem * this.barMetrics.length)
        : 0;
    },
    barMetrics() {
      let barMetrics = [];
      this.metrics.forEach((m, i) => {
        if (m.type == "bar") {
          barMetrics.push(Object.assign({ index: i }, m));
        }
      });
      return barMetrics;
    },
    lineMetrics() {
      let lineMetrics = [];
      this.metrics.forEach((m, i) => {
        if (!m.type || m.type == "line") {
          lineMetrics.push(Object.assign({ index: i }, m));
        }
      });
      return lineMetrics;
    },
    scaleLeft() {
      if (!this.scales.left) return undefined;
      let { name, label, domain } = this.scales.left;
      return d3[name]()
        .domain(domain(this.data))
        .range([this.quadrantHeight, 0]);
    },

    scaleTop() {
      if (!this.scales.top) return undefined;
      let { name, label, domain } = this.scales.top;
      return d3[name]()
        .domain(domain(this.data))
        .range([0, this.quadrantWidth]);
    },

    scaleBottom() {
      if (!this.scales.bottom) return undefined;
      let { name, label, domain } = this.scales.bottom;
      return d3[name]()
        .domain(domain(this.data))
        .range([0, this.quadrantWidth]);
    },

    scaleRight() {
      if (!this.scales.right) return undefined;
      let { name, label, domain } = this.scales.right;
      return d3[name]()
        .domain(domain(this.data))
        .range([this.quadrantHeight, 0]);
    },

    scaleColor() {
      return d3.scaleOrdinal(this.scales.color || d3.schemeCategory10);
    },

    labelLeft() {
      let { left } = this.scales;
      return left && left.label;
    },

    labelRight() {
      let { right } = this.scales;
      return right && right.label;
    },

    labelBottom() {
      let { bottom } = this.scales;
      return bottom && bottom.label;
    },

    labelTop() {
      let { top } = this.scales;
      return top && top.label;
    },

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
    scaleDimension(metric, d) {
      let {
          dimension: { scale: scaleName, map: dimensionMap }
        } = metric,
        scale = this[
          `scale${scaleName.charAt(0).toUpperCase() + scaleName.slice(1)}`
        ],
        map = dimensionMap || this.scales[scaleName].map || (d => d);
      return scale(map(d));
    },
    scaleMetric(metric, d) {
      let {
          metric: { scale: scaleName, map: metricMap }
        } = metric,
        scale = this[
          `scale${scaleName.charAt(0).toUpperCase() + scaleName.slice(1)}`
        ];
      metricMap = metricMap || (d => d);
      return scale(metricMap(d));
    },
    line(metric) {
      return d3
        .line()
        .x(d => this.scaleDimension(metric, d))
        .y(d => this.scaleMetric(metric, d));
    },
    show(position) {
      return this.axes.indexOf(position) >= 0;
    },

    renderAxes() {
      if (this.show("top") && this.scaleTop) {
        d3.select(this.$refs.topAxis).call(d3.axisTop().scale(this.scaleTop));
      }
      if (this.show("right") && this.scaleRight) {
        d3.select(this.$refs.rightAxis).call(
          d3.axisRight().scale(this.scaleRight)
        );
      }
      if (this.show("bottom") && this.scaleBottom) {
        d3.select(this.$refs.bottomAxis).call(
          d3.axisBottom().scale(this.scaleBottom)
        );
      }
      if (this.show("left") && this.scaleLeft) {
        d3.select(this.$refs.leftAxis).call(
          d3.axisLeft().scale(this.scaleLeft)
        );
      }

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
    },

    select(e) {
      if (e.ctrlKey) {
      } else {
      }
    }
  },
  components: {}
};
</script>

<style lang="scss" scoped>
.line {
  fill: none;
  stroke-width: 1.5;
  stroke-opacity: 0.6;
}

.dot {
  stroke-width: 0.5px;
}

.dot:hover {
  stroke-width: 4px;
}

.bar {
  stroke-width: 1px;
  stroke-opacity: 0;
}

.bar:hover {
  stroke-width: 1px;
  stroke-opacity: 0.9;
}

.legend {
  font: 11px sans-serif;
}
</style>

<style lang="scss">
.axis path,
.axis line {
  fill: none;
  stroke: #000;
  stroke-width: 1;
  stroke-opacity: 0.3;
  shape-rendering: geometricPrecision;
}

.axis text {
  font: 12px sans-serif;
  user-select: none;
}

.axis .grid-line {
  stroke: black;
  stroke-width: 0.1;
  shape-rendering: geometricPrecision;
  stroke-opacity: 1;
}
</style>
