<template>
  <g :class="[classList]" ref="axis" :style="style"></g>
</template>

<script>
import * as d3 from "d3";

export default {
  name: "D3Axis",
  data() {
    return {
      // Return class list
      classList: ["axis"].concat(this.getAxisClasses())
    };
  },
  props: {
    axis: {
      type: String,
      validator(v) {
        return ["left", "right", "top", "bottom"].indexOf(v) > -1;
      }
    },
    layout: Object,
    scale: Object
  },
  mounted() {
    this.drawAxis();
  },
  computed: {
    style() {
      return {
        transform: this.getAxisTransform()
      };
    }
  },
  watch: {
    // Changes to scale means we have to redraw the line!
    scale: {
      deep: true,
      handler(val, oldVal) {
        this.drawAxis();
      }
    }
  },
  methods: {
    // Return a class list containg the appropriate labels for axes
    getAxisClasses() {
      var axis = {
        top: "x",
        bottom: "x",
        left: "y",
        right: "y"
      };
      return [this.axis, axis[this.axis]];
    },

    // Draw axis
    drawAxis() {
      var t = d3.transition(500);
      var $axis = d3.select(this.$refs.axis);
      var scale = this.scale;
      var axisGenerator = {
        top: d3.axisTop(scale.x).tickFormat(d3.timeFormat("%b %d")),
        right: d3.axisRight(scale.y),
        bottom: d3.axisBottom(scale.x).tickFormat(d3.timeFormat("%b %d")),
        left: d3.axisLeft(scale.y)
      };

      // Transition the axis, and then call/construct it
      $axis.transition(t).call(axisGenerator[this.axis]);
    },

    // Return necessary axis transformation for proper positioning
    getAxisTransform() {
      var axisOffset = {
        top: {
          x: 0,
          y: 0
        },
        right: {
          x: this.layout.width,
          y: 0
        },
        bottom: {
          x: 0,
          y: this.layout.height
        },
        left: {
          x: 0,
          y: 0
        }
      };

      return (
        "translate(" +
        axisOffset[this.axis].x +
        "px, " +
        axisOffset[this.axis].y +
        "px)"
      );
    }
  }
};
</script>

<style lang="scss" scoped>
</style>
