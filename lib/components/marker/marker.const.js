"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true,
});
exports.SIZES = exports.MARKERS = exports.MARKER_SMALL_SIZE = exports.MARKER_MEDIUM_OFFSET = exports.MARKER_LARGE_OFFSET = exports.HIGHLIGHTED = void 0;
const HIGHLIGHTED = "H";
exports.HIGHLIGHTED = HIGHLIGHTED;
const MARKER_SMALL_SIZE = 16;
exports.MARKER_SMALL_SIZE = MARKER_SMALL_SIZE;
const MARKER_MEDIUM_OFFSET = 2;
exports.MARKER_MEDIUM_OFFSET = MARKER_MEDIUM_OFFSET;
const MARKER_LARGE_OFFSET = 4; // internal marker flavors for cross referencing

exports.MARKER_LARGE_OFFSET = MARKER_LARGE_OFFSET;
const MARKERS = {
  MARKER_S: "marker-small",
  MARKER_SH: "marker-small-highlighted",
  MARKER_M: "marker-medium",
  MARKER_MH: "marker-medium-highlighted",
  MARKER_L: "marker-large",
  MARKER_LH: "marker-large-highlighted",
}; // hard coded aggregation of the different sizes available for markers

exports.MARKERS = MARKERS;
const SIZES = {
  S: "S",
  M: "M",
  L: "L",
};
exports.SIZES = SIZES;
