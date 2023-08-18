"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true,
});
exports.default = void 0;

var _react = _interopRequireDefault(require("react"));

var _node = _interopRequireDefault(require("./node.helper"));

var _node2 = _interopRequireDefault(require("./node.const"));

var _utils = require("../../utils");

function _interopRequireDefault(obj) {
  return obj && obj.__esModule ? obj : { default: obj };
}

function _extends() {
  _extends =
    Object.assign ||
    function(target) {
      for (var i = 1; i < arguments.length; i++) {
        var source = arguments[i];
        for (var key in source) {
          if (Object.prototype.hasOwnProperty.call(source, key)) {
            target[key] = source[key];
          }
        }
      }
      return target;
    };
  return _extends.apply(this, arguments);
}

function ownKeys(object, enumerableOnly) {
  var keys = Object.keys(object);
  if (Object.getOwnPropertySymbols) {
    var symbols = Object.getOwnPropertySymbols(object);
    if (enumerableOnly) {
      symbols = symbols.filter(function(sym) {
        return Object.getOwnPropertyDescriptor(object, sym).enumerable;
      });
    }
    keys.push.apply(keys, symbols);
  }
  return keys;
}

function _objectSpread(target) {
  for (var i = 1; i < arguments.length; i++) {
    var source = arguments[i] != null ? arguments[i] : {};
    if (i % 2) {
      ownKeys(Object(source), true).forEach(function(key) {
        _defineProperty(target, key, source[key]);
      });
    } else if (Object.getOwnPropertyDescriptors) {
      Object.defineProperties(target, Object.getOwnPropertyDescriptors(source));
    } else {
      ownKeys(Object(source)).forEach(function(key) {
        Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key));
      });
    }
  }
  return target;
}

function _defineProperty(obj, key, value) {
  if (key in obj) {
    Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true });
  } else {
    obj[key] = value;
  }
  return obj;
}

/**
 * Node component is responsible for encapsulating node render.
 * @example
 * const onClickNode = function(nodeId) {
 *     window.alert('Clicked node', nodeId);
 * };
 *
 * const onRightClickNode = function(nodeId) {
 *     window.alert('Right clicked node', nodeId);
 * }
 *
 * const onMouseOverNode = function(nodeId) {
 *     window.alert('Mouse over node', nodeId);
 * };
 *
 * const onMouseOutNode = function(nodeId) {
 *     window.alert('Mouse out node', nodeId);
 * };
 *
 * const generateCustomNode(node) {
 *     return <CustomComponent node={node} />;
 * }
 *
 * <Node
 *     id='nodeId'
 *     cx=22
 *     cy=22
 *     fill='green'
 *     fontSize=10
 *     fontColor='black'
 *     fontWeight='normal'
 *     dx=90
 *     label='label text'
 *     labelPosition='top'
 *     opacity=1
 *     renderLabel=true
 *     size=200
 *     stroke='none'
 *     strokeWidth=1.5
 *     svg='assets/my-svg.svg'
 *     type='square'
 *     viewGenerator={generateCustomNode}
 *     className='node'
 *     onClickNode={onClickNode}
 *     onRightClickNode={onRightClickNode}
 *     onMouseOverNode={onMouseOverNode}
 *     onMouseOutNode={onMouseOutNode} />
 */
class Node extends _react.default.Component {
  constructor(...args) {
    super(...args);

    _defineProperty(this, "handleOnClickNode", () => this.props.onClickNode && this.props.onClickNode(this.props.id));

    _defineProperty(
      this,
      "handleOnRightClickNode",
      event => this.props.onRightClickNode && this.props.onRightClickNode(event, this.props.id)
    );

    _defineProperty(
      this,
      "handleOnMouseOverNode",
      () => this.props.onMouseOverNode && this.props.onMouseOverNode(this.props.id)
    );

    _defineProperty(this, "handleOnMouseOutNode", () => this.props.onMouseOut && this.props.onMouseOut(this.props.id));
  }

  render() {
    const nodeProps = {
      cursor: this.props.cursor,
      onClick: this.handleOnClickNode,
      onContextMenu: this.handleOnRightClickNode,
      onMouseOut: this.handleOnMouseOutNode,
      onMouseOver: this.handleOnMouseOverNode,
      opacity: this.props.opacity,
    };

    const textProps = _objectSpread(
      _objectSpread({}, _node.default.getLabelPlacementProps(this.props.dx, this.props.labelPosition)),
      {},
      {
        fill: this.props.fontColor,
        fontSize: this.props.fontSize,
        fontWeight: this.props.fontWeight,
        opacity: this.props.opacity,
      },
      this.props.labelClass && {
        className: this.props.labelClass,
      }
    );

    let size = this.props.size;
    const isSizeNumericalValue = typeof size !== "object";
    let gtx = this.props.cx,
      gty = this.props.cy,
      label = null,
      node = null;

    if (this.props.svg || this.props.viewGenerator) {
      const height = isSizeNumericalValue ? size / 10 : size.height / 10;
      const width = isSizeNumericalValue ? size / 10 : size.width / 10;
      const tx = width / 2;
      const ty = height / 2;
      const transform = `translate(${tx},${ty})`;
      label = /*#__PURE__*/ _react.default.createElement(
        "text",
        _extends({}, textProps, {
          transform: transform,
        }),
        this.props.label
      ); // By default, if a view generator is set, it takes precedence over any svg image url

      if (this.props.viewGenerator && !this.props.overrideGlobalViewGenerator) {
        node = /*#__PURE__*/ _react.default.createElement(
          "svg",
          _extends({}, nodeProps, {
            width: width,
            height: height,
          }),
          /*#__PURE__*/ _react.default.createElement(
            "foreignObject",
            {
              x: "0",
              y: "0",
              width: "100%",
              height: "100%",
            },
            /*#__PURE__*/ _react.default.createElement(
              "section",
              {
                style: {
                  height,
                  width,
                  backgroundColor: "transparent",
                },
              },
              this.props.viewGenerator(this.props)
            )
          )
        );
      } else {
        node = /*#__PURE__*/ _react.default.createElement(
          "image",
          _extends({}, nodeProps, {
            href: this.props.svg,
            width: width,
            height: height,
          })
        );
      } // svg offset transform regarding svg width/height

      gtx -= tx;
      gty -= ty;
    } else {
      if (!isSizeNumericalValue) {
        (0, _utils.logWarning)("node.size should be a number when not using custom nodes.");
        size = _node2.default.DEFAULT_NODE_SIZE;
      }

      nodeProps.d = _node.default.buildSvgSymbol(size, this.props.type);
      nodeProps.fill = this.props.fill;
      nodeProps.stroke = this.props.stroke;
      nodeProps.strokeWidth = this.props.strokeWidth;
      label = /*#__PURE__*/ _react.default.createElement("text", textProps, this.props.label);
      node = /*#__PURE__*/ _react.default.createElement("path", nodeProps);
    }

    const gProps = {
      className: this.props.className,
      cx: this.props.cx,
      cy: this.props.cy,
      id: this.props.id,
      transform: `translate(${gtx},${gty})`,
    };
    return /*#__PURE__*/ _react.default.createElement("g", gProps, node, this.props.renderLabel && label);
  }
}

exports.default = Node;
