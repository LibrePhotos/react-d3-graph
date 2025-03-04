"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true,
});
exports.buildLinkPathDefinition = buildLinkPathDefinition;

var _link = require("./link.const");

/**
 * @module Link/helper
 * @description
 * A set of helper methods to manipulate/create links.
 */

/**
 * Computes radius value for a straight line.
 * @returns {number} radius for straight line.
 * @memberof Link/helper
 */
function straightLineRadius() {
  return 0;
}
/**
 * Computes radius for a smooth curve effect.
 * @param {number} x1 - x value for point 1
 * @param {number} y1 - y value for point 1
 * @param {number} x2 - y value for point 2
 * @param {number} y2 - y value for point 2
 * @returns{number} value of radius.
 * @memberof Link/helper
 */

function smoothCurveRadius(x1, y1, x2, y2) {
  const dx = x2 - x1;
  const dy = y2 - y1;
  return Math.sqrt(dx * dx + dy * dy);
}
/**
 * Computes radius value for a full curve (semi circumference).
 * @returns {number} radius for full curve.
 * @memberof Link/helper
 */

function fullCurveRadius() {
  return 1;
}

const RADIUS_STRATEGIES = {
  [_link.LINE_TYPES.STRAIGHT]: straightLineRadius,
  [_link.LINE_TYPES.CURVE_SMOOTH]: smoothCurveRadius,
  [_link.LINE_TYPES.CURVE_FULL]: fullCurveRadius,
};
/**
 * Get a strategy to compute line radius.<br/>
 * *CURVE_SMOOTH* type inspired by {@link http://bl.ocks.org/mbostock/1153292|mbostock - Mobile Patent Suits}.
 * @param {string} [type=LINE_TYPES.STRAIGHT] type of curve to get radius strategy from.
 * @returns {Function} a function that calculates a radius
 * to match curve type expectation. Fallback is the straight line.
 * @memberof Link/helper
 */

function getRadiusStrategy(type) {
  return RADIUS_STRATEGIES[type] || RADIUS_STRATEGIES[_link.LINE_TYPES.STRAIGHT];
}
/**
 * This method returns the path definition for a given link base on the line type
 * and the link source and target.
 * {@link https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/d|d attribute mdn}
 * @param {Object} sourceCoords - link sourceCoords
 * @param {Object} targetCoords - link targetCoords
 * @param {string} type - the link line type
 * @param {Array.<Object>} breakPoints - additional set of points that the link will cross
 * @param {string|number} sourceId - the source node id
 * @param {string|number} targetId - the target node id
 * @param {string} selfLinkDirection - the direction that self links will be rendered in
 * @returns {string} the path definition for the requested link
 * @memberof Link/helper
 */

function buildLinkPathDefinition(
  sourceCoords = {},
  targetCoords = {},
  type = _link.LINE_TYPES.STRAIGHT,
  breakPoints = [],
  sourceId,
  targetId,
  selfLinkDirection = _link.SELF_LINK_DIRECTION.TOP_RIGHT
) {
  const { x: sx, y: sy } = sourceCoords;
  const { x: tx, y: ty } = targetCoords;

  if (sourceId === targetId && sx === tx && sy === ty) {
    switch (selfLinkDirection) {
      case _link.SELF_LINK_DIRECTION.TOP_LEFT:
        return `M${sx},${sy} A40,30 45 1,1 ${tx + 1},${ty - 1}`;

      case _link.SELF_LINK_DIRECTION.BOTTOM_LEFT:
        return `M${sx},${sy} A40,30 -45 1,1 ${tx - 1},${ty - 1}`;

      case _link.SELF_LINK_DIRECTION.BOTTOM_RIGHT:
        return `M${sx},${sy} A40,30 45 1,1 ${tx - 1},${ty + 1}`;

      default:
        return `M${sx},${sy} A40,30 -45 1,1 ${tx + 1},${ty + 1}`;
    }
  }

  const validType = _link.LINE_TYPES[type] || _link.LINE_TYPES.STRAIGHT;
  const calcRadiusFn = getRadiusStrategy(validType);
  const restOfLinkPoints = [...breakPoints, targetCoords];
  const restOfLinkPath = restOfLinkPoints
    .map(({ x, y }, i) => {
      const { x: px, y: py } = i > 0 ? restOfLinkPoints[i - 1] : sourceCoords;
      const radius = calcRadiusFn(px, py, x, y);
      return ` A${radius},${radius} 0 0,1 ${x},${y}`;
    })
    .join("");
  return `M${sx},${sy}${restOfLinkPath}`;
}
