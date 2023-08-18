"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true,
});
exports.default = void 0;

var _react = _interopRequireDefault(require("react"));

function _interopRequireDefault(obj) {
  return obj && obj.__esModule ? obj : { default: obj };
}

/**
 * Market component provides configurable interface to marker definition.
 * @example
 *
 * <Marker id="marker-id" fill="black" />
 */
class Marker extends _react.default.Component {
  render() {
    return /*#__PURE__*/ _react.default.createElement(
      "marker",
      {
        className: "marker",
        id: this.props.id,
        viewBox: "0 -5 10 10",
        refX: this.props.refX,
        refY: "0",
        markerWidth: this.props.markerWidth,
        markerHeight: this.props.markerHeight,
        orient: "auto",
        fill: this.props.fill,
      },
      /*#__PURE__*/ _react.default.createElement("path", {
        d: "M0,-5L10,0L0,5",
      })
    );
  }
}

exports.default = Marker;
