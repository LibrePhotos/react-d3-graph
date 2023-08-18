"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true,
});
exports.default = void 0;

var _react = _interopRequireDefault(require("react"));

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

function _defineProperty(obj, key, value) {
  if (key in obj) {
    Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true });
  } else {
    obj[key] = value;
  }
  return obj;
}

/**
 * Link component is responsible for encapsulating link render.
 * @example
 * const onClickLink = function(source, target) {
 *      window.alert(`Clicked link between ${source} and ${target}`);
 * };
 *
 * const onRightClickLink = function(source, target) {
 *      window.alert(`Right clicked link between ${source} and ${target}`);
 * };
 *
 * const onMouseOverLink = function(source, target) {
 *      window.alert(`Mouse over in link between ${source} and ${target}`);
 * };
 *
 * const onMouseOutLink = function(source, target) {
 *      window.alert(`Mouse out link between ${source} and ${target}`);
 * };
 *
 * <Link
 *     d="M1..."
 *     source="idSourceNode"
 *     target="idTargetNode"
 *     markerId="marker-small"
 *     strokeWidth=1.5
 *     stroke="green"
 *     strokeDasharray="5 1"
 *     strokeDashoffset="3"
 *     strokeLinecap="round"
 *     className="link"
 *     opacity=1
 *     mouseCursor="pointer"
 *     onClickLink={onClickLink}
 *     onRightClickLink={onRightClickLink}
 *     onMouseOverLink={onMouseOverLink}
 *     onMouseOutLink={onMouseOutLink} />
 */
class Link extends _react.default.Component {
  constructor(...args) {
    super(...args);

    _defineProperty(
      this,
      "handleOnClickLink",
      () => this.props.onClickLink && this.props.onClickLink(this.props.source, this.props.target)
    );

    _defineProperty(
      this,
      "handleOnRightClickLink",
      event => this.props.onRightClickLink && this.props.onRightClickLink(event, this.props.source, this.props.target)
    );

    _defineProperty(
      this,
      "handleOnMouseOverLink",
      () => this.props.onMouseOverLink && this.props.onMouseOverLink(this.props.source, this.props.target)
    );

    _defineProperty(
      this,
      "handleOnMouseOutLink",
      () => this.props.onMouseOutLink && this.props.onMouseOutLink(this.props.source, this.props.target)
    );
  }

  render() {
    const lineStyle = {
      strokeWidth: this.props.strokeWidth,
      stroke: this.props.stroke,
      opacity: this.props.opacity,
      fill: "none",
      cursor: this.props.mouseCursor,
      strokeDasharray: this.props.strokeDasharray,
      strokeDashoffset: this.props.strokeDasharray,
      strokeLinecap: this.props.strokeLinecap,
    };
    const lineProps = {
      className: this.props.className,
      d: this.props.d,
      onClick: this.handleOnClickLink,
      onContextMenu: this.handleOnRightClickLink,
      onMouseOut: this.handleOnMouseOutLink,
      onMouseOver: this.handleOnMouseOverLink,
      style: lineStyle,
    };

    if (this.props.markerId) {
      lineProps.markerEnd = `url(#${this.props.markerId})`;
    }

    const { label, id } = this.props;
    const textProps = {
      dy: -1,
      style: {
        fill: this.props.fontColor,
        fontSize: this.props.fontSize,
        fontWeight: this.props.fontWeight,
      },
    };
    return /*#__PURE__*/ _react.default.createElement(
      "g",
      null,
      /*#__PURE__*/ _react.default.createElement(
        "path",
        _extends({}, lineProps, {
          id: id,
        })
      ),
      label &&
        /*#__PURE__*/ _react.default.createElement(
          "text",
          _extends(
            {
              style: {
                textAnchor: "middle",
              },
            },
            textProps
          ),
          /*#__PURE__*/ _react.default.createElement(
            "textPath",
            {
              href: `#${id}`,
              startOffset: "50%",
            },
            label
          )
        )
    );
  }
}

exports.default = Link;
