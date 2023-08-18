"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true,
});
exports.default = void 0;

var _react = _interopRequireDefault(require("react"));

var _d = require("d3");

var _graph = _interopRequireDefault(require("./graph.const"));

var _graph2 = _interopRequireDefault(require("./graph.config"));

var _err = _interopRequireDefault(require("../../err"));

var _collapse = require("./collapse.helper");

var _graph3 = require("./graph.helper");

var _graph4 = require("./graph.renderer");

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
 * Graph component is the main component for react-d3-graph components, its interface allows its user
 * to build the graph once the user provides the data, configuration (optional) and callback interactions (also optional).
 * The code for the [live example](https://danielcaldas.github.io/react-d3-graph/sandbox/index.html)
 * can be consulted [here](https://github.com/danielcaldas/react-d3-graph/blob/master/sandbox/Sandbox.jsx)
 * @example
 * import { Graph } from 'react-d3-graph';
 *
 * // graph payload (with minimalist structure)
 * const data = {
 *     nodes: [
 *       {id: 'Harry'},
 *       {id: 'Sally'},
 *       {id: 'Alice'}
 *     ],
 *     links: [
 *         {source: 'Harry', target: 'Sally'},
 *         {source: 'Harry', target: 'Alice'},
 *     ]
 * };
 *
 * // the graph configuration, you only need to pass down properties
 * // that you want to override, otherwise default ones will be used
 * const myConfig = {
 *     nodeHighlightBehavior: true,
 *     node: {
 *         color: 'lightgreen',
 *         size: 120,
 *         highlightStrokeColor: 'blue'
 *     },
 *     link: {
 *         highlightColor: 'lightblue'
 *     }
 * };
 *
 * // Callback to handle click on the graph.
 * // @param {Object} event click dom event
 * const onClickGraph = function(event) {
 *      window.alert('Clicked the graph background');
 * };
 *
 * const onClickNode = function(nodeId, node) {
 *      window.alert('Clicked node ${nodeId} in position (${node.x}, ${node.y})');
 * };
 *
 * const onDoubleClickNode = function(nodeId, node) {
 *      window.alert('Double clicked node ${nodeId} in position (${node.x}, ${node.y})');
 * };
 *
 * const onRightClickNode = function(event, nodeId, node) {
 *      window.alert('Right clicked node ${nodeId} in position (${node.x}, ${node.y})');
 * };
 *
 * const onMouseOverNode = function(nodeId, node) {
 *      window.alert(`Mouse over node ${nodeId} in position (${node.x}, ${node.y})`);
 * };
 *
 * const onMouseOutNode = function(nodeId, node) {
 *      window.alert(`Mouse out node ${nodeId} in position (${node.x}, ${node.y})`);
 * };
 *
 * const onClickLink = function(source, target) {
 *      window.alert(`Clicked link between ${source} and ${target}`);
 * };
 *
 * const onRightClickLink = function(event, source, target) {
 *      window.alert('Right clicked link between ${source} and ${target}');
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
 * const onNodePositionChange = function(nodeId, x, y) {
 *      window.alert(`Node ${nodeId} moved to new position x= ${x} y= ${y}`);
 * };
 *
 * // Callback that's called whenever the graph is zoomed in/out
 * // @param {number} previousZoom the previous graph zoom
 * // @param {number} newZoom the new graph zoom
 * const onZoomChange = function(previousZoom, newZoom) {
 *      window.alert(`Graph is now zoomed at ${newZoom} from ${previousZoom}`);
 * };
 *
 *
 * <Graph
 *      id='graph-id' // id is mandatory, if no id is defined rd3g will throw an error
 *      data={data}
 *      config={myConfig}
 *      onClickGraph={onClickGraph}
 *      onClickNode={onClickNode}
 *      onDoubleClickNode={onDoubleClickNode}
 *      onRightClickNode={onRightClickNode}
 *      onClickLink={onClickLink}
 *      onRightClickLink={onRightClickLink}
 *      onMouseOverNode={onMouseOverNode}
 *      onMouseOutNode={onMouseOutNode}
 *      onMouseOverLink={onMouseOverLink}
 *      onMouseOutLink={onMouseOutLink}
 *      onNodePositionChange={onNodePositionChange}
 *      onZoomChange={onZoomChange}/>
 */
class Graph extends _react.default.Component {
  /**
   * Obtain a set of properties which will be used to perform the focus and zoom animation if
   * required. In case there's not a focus and zoom animation in progress, it should reset the
   * transition duration to zero and clear transformation styles.
   * @returns {Object} - Focus and zoom animation properties.
   */

  /**
   * This method runs {@link d3-force|https://github.com/d3/d3-force}
   * against the current graph.
   * @returns {undefined}
   */
  _graphLinkForceConfig() {
    const forceLink = (0, _d.forceLink)(this.state.d3Links)
      .id(l => l.id)
      .distance(this.state.config.d3.linkLength)
      .strength(this.state.config.d3.linkStrength);
    this.state.simulation.force(_graph.default.LINK_CLASS_NAME, forceLink);
  }
  /**
   * This method runs {@link d3-drag|https://github.com/d3/d3-drag}
   * against the current graph.
   * @returns {undefined}
   */

  _graphNodeDragConfig() {
    const customNodeDrag = (0, _d.drag)()
      .on("start", this._onDragStart)
      .on("drag", this._onDragMove)
      .on("end", this._onDragEnd);
    (0, _d.select)(`#${this.state.id}-${_graph.default.GRAPH_WRAPPER_ID}`)
      .selectAll("g.node[id]")
      .datum(function() {
        return this.id; // The variable `this` will be equal to each of the selected `HTMLElement`s!
      })
      .call(customNodeDrag);
  }
  /**
   * Sets d3 tick function and configures other d3 stuff such as forces and drag events.
   * Whenever called binds Graph component state with d3.
   * @returns {undefined}
   */

  _graphBindD3ToReactComponent() {
    if (!this.state.config.d3.disableLinkForce) {
      this.state.simulation.nodes(this.state.d3Nodes).on("tick", () => {
        // Propagate d3Nodes changes to nodes
        const newNodes = {};

        for (const node of this.state.d3Nodes) {
          newNodes[node.id] = node;
        }

        this._tick({
          d3Nodes: this.state.d3Nodes,
          nodes: newNodes,
        });
      });

      this._graphLinkForceConfig();
    }

    if (!this.state.config.freezeAllDragEvents) {
      this._graphNodeDragConfig();
    }
  }
  /**
   * Handles d3 drag 'end' event.
   * @returns {undefined}
   */

  constructor(props) {
    super(props);

    _defineProperty(this, "_generateFocusAnimationProps", () => {
      // In case an older animation was still not complete, clear previous timeout to ensure the new one is not cancelled
      if (this.state.enableFocusAnimation) {
        if (this.focusAnimationTimeout) {
          clearTimeout(this.focusAnimationTimeout);
        }

        this.focusAnimationTimeout = setTimeout(
          () =>
            this.setState({
              enableFocusAnimation: false,
            }),
          this.state.config.focusAnimationDuration * 1000
        );
      }

      const transitionDuration = this.state.enableFocusAnimation ? this.state.config.focusAnimationDuration : 0;
      return {
        style: {
          transitionDuration: `${transitionDuration}s`,
        },
        transform: this.state.focusTransformation,
      };
    });

    _defineProperty(this, "_onDragEnd", () => {
      this.isDraggingNode = false;

      if (this.state.draggedNode) {
        this.onNodePositionChange(this.state.draggedNode);

        this._tick({
          draggedNode: null,
        });
      }

      !this.state.config.staticGraph &&
        this.state.config.automaticRearrangeAfterDropNode &&
        this.state.simulation.alphaTarget(this.state.config.d3.alphaTarget).restart();
    });

    _defineProperty(this, "_onDragMove", (d3Event, datum) => {
      if (!this.state.config.staticGraph) {
        // this is where d3 and react bind
        let draggedNode = this.state.nodes[datum];
        draggedNode.oldX = draggedNode.x;
        draggedNode.oldY = draggedNode.y;
        const newX = draggedNode.x + d3Event.dx;
        const newY = draggedNode.y + d3Event.dy;
        const shouldUpdateNode =
          !this.state.config.bounded ||
          (0, _graph3.isPositionInBounds)(
            {
              x: newX,
              y: newY,
            },
            this.state
          );

        if (shouldUpdateNode) {
          draggedNode.x = newX;
          draggedNode.y = newY; // set nodes fixing coords fx and fy

          draggedNode["fx"] = draggedNode.x;
          draggedNode["fy"] = draggedNode.y;

          this._tick({
            draggedNode,
          });
        }
      }
    });

    _defineProperty(this, "_onDragStart", () => {
      this.isDraggingNode = true;
      this.pauseSimulation();

      if (this.state.enableFocusAnimation) {
        this.setState({
          enableFocusAnimation: false,
        });
      }
    });

    _defineProperty(this, "_setNodeHighlightedValue", (id, value = false) =>
      this._tick(
        (0, _graph3.updateNodeHighlightedValue)(this.state.nodes, this.state.links, this.state.config, id, value)
      )
    );

    _defineProperty(this, "_tick", (state = {}, cb) => (cb ? this.setState(state, cb) : this.setState(state)));

    _defineProperty(this, "_zoomConfig", () => {
      const selector = (0, _d.select)(`#${this.state.id}-${_graph.default.GRAPH_WRAPPER_ID}`);
      const zoomObject = (0, _d.zoom)().scaleExtent([this.state.config.minZoom, this.state.config.maxZoom]);

      if (!this.state.config.freezeAllDragEvents) {
        zoomObject.on("zoom", this._zoomed);
      }

      if (this.state.config.initialZoom !== null) {
        zoomObject.scaleTo(selector, this.state.config.initialZoom);
      } // avoid double click on graph to trigger zoom
      // for more details consult: https://github.com/danielcaldas/react-d3-graph/pull/202

      selector.call(zoomObject).on("dblclick.zoom", null);
    });

    _defineProperty(this, "_zoomed", d3Event => {
      const transform = d3Event.transform;
      (0, _d.selectAll)(`#${this.state.id}-${_graph.default.GRAPH_CONTAINER_ID}`).attr("transform", transform);
      this.setState({
        transform,
      }); // only send zoom change events if the zoom has changed (_zoomed() also gets called when panning)

      if (this.debouncedOnZoomChange && this.state.previousZoom !== transform.k && !this.state.config.panAndZoom) {
        this.debouncedOnZoomChange(this.state.previousZoom, transform.k);
        this.setState({
          previousZoom: transform.k,
        });
      }
    });

    _defineProperty(this, "onClickGraph", e => {
      var _e$target, _e$target$attributes, _e$target$attributes$;

      if (this.state.enableFocusAnimation) {
        this.setState({
          enableFocusAnimation: false,
        });
      } // Only trigger the graph onClickHandler, if not clicked a node or link.
      // toUpperCase() is added as a precaution, as the documentation says tagName should always
      // return in UPPERCASE, but chrome returns lowercase

      const tagName = e.target && e.target.tagName;
      const name =
        e === null || e === void 0
          ? void 0
          : (_e$target = e.target) === null || _e$target === void 0
          ? void 0
          : (_e$target$attributes = _e$target.attributes) === null || _e$target$attributes === void 0
          ? void 0
          : (_e$target$attributes$ = _e$target$attributes.name) === null || _e$target$attributes$ === void 0
          ? void 0
          : _e$target$attributes$.value;
      const svgContainerName = `svg-container-${this.state.id}`;

      if (tagName.toUpperCase() === "SVG" && name === svgContainerName) {
        this.props.onClickGraph && this.props.onClickGraph(e);
      }
    });

    _defineProperty(this, "onClickNode", clickedNodeId => {
      const clickedNode = this.state.nodes[clickedNodeId];

      if (!this.nodeClickTimer) {
        // Note: onDoubleClickNode is not defined we don't need a long wait
        // to understand weather a second click will arrive soon or not
        // we can immediately trigger the click timer because we're 100%
        // that the double click even is never intended
        const ttl = this.props.onDoubleClickNode ? _graph.default.TTL_DOUBLE_CLICK_IN_MS : 0;
        this.nodeClickTimer = setTimeout(() => {
          if (this.state.config.collapsible) {
            const leafConnections = (0, _collapse.getTargetLeafConnections)(
              clickedNodeId,
              this.state.links,
              this.state.config
            );
            const links = (0, _collapse.toggleLinksMatrixConnections)(
              this.state.links,
              leafConnections,
              this.state.config
            );
            const d3Links = (0, _collapse.toggleLinksConnections)(this.state.d3Links, links);
            const firstLeaf = leafConnections === null || leafConnections === void 0 ? void 0 : leafConnections["0"];
            let isExpanding = false;

            if (firstLeaf) {
              const visibility = links[firstLeaf.source][firstLeaf.target];
              isExpanding = visibility === 1;
            }

            this._tick(
              {
                links,
                d3Links,
              },
              () => {
                this.props.onClickNode && this.props.onClickNode(clickedNodeId, clickedNode);

                if (isExpanding) {
                  this._graphNodeDragConfig();
                }
              }
            );
          } else {
            this.props.onClickNode && this.props.onClickNode(clickedNodeId, clickedNode);
          }

          this.nodeClickTimer = null;
        }, ttl);
      } else {
        this.props.onDoubleClickNode && this.props.onDoubleClickNode(clickedNodeId, clickedNode);
        this.nodeClickTimer = clearTimeout(this.nodeClickTimer);
      }
    });

    _defineProperty(this, "onRightClickNode", (event, id) => {
      const clickedNode = this.state.nodes[id];
      this.props.onRightClickNode && this.props.onRightClickNode(event, id, clickedNode);
    });

    _defineProperty(this, "onMouseOverNode", id => {
      if (this.isDraggingNode) {
        return;
      }

      const clickedNode = this.state.nodes[id];
      this.props.onMouseOverNode && this.props.onMouseOverNode(id, clickedNode);
      this.state.config.nodeHighlightBehavior && this._setNodeHighlightedValue(id, true);
    });

    _defineProperty(this, "onMouseOutNode", id => {
      if (this.isDraggingNode) {
        return;
      }

      const clickedNode = this.state.nodes[id];
      this.props.onMouseOutNode && this.props.onMouseOutNode(id, clickedNode);
      this.state.config.nodeHighlightBehavior && this._setNodeHighlightedValue(id, false);
    });

    _defineProperty(this, "onMouseOverLink", (source, target) => {
      this.props.onMouseOverLink && this.props.onMouseOverLink(source, target);

      if (this.state.config.linkHighlightBehavior) {
        const highlightedLink = {
          source,
          target,
        };

        this._tick({
          highlightedLink,
        });
      }
    });

    _defineProperty(this, "onMouseOutLink", (source, target) => {
      this.props.onMouseOutLink && this.props.onMouseOutLink(source, target);

      if (this.state.config.linkHighlightBehavior) {
        const highlightedLink = undefined;

        this._tick({
          highlightedLink,
        });
      }
    });

    _defineProperty(this, "onNodePositionChange", node => {
      if (!this.props.onNodePositionChange) {
        return;
      }

      const { id, x, y } = node;
      this.props.onNodePositionChange(id, x, y);
    });

    _defineProperty(this, "pauseSimulation", () => this.state.simulation.stop());

    _defineProperty(this, "resetNodesPositions", () => {
      if (!this.state.config.staticGraph) {
        let initialNodesState = (0, _graph3.initializeNodes)(this.props.data.nodes);

        for (let nodeId in this.state.nodes) {
          let node = this.state.nodes[nodeId];

          if (node.fx && node.fy) {
            Reflect.deleteProperty(node, "fx");
            Reflect.deleteProperty(node, "fy");
          }

          if (nodeId in initialNodesState) {
            let initialNode = initialNodesState[nodeId];
            node.x = initialNode.x;
            node.y = initialNode.y;
          }
        }

        this.state.simulation.alphaTarget(this.state.config.d3.alphaTarget).restart();

        this._tick();
      }
    });

    _defineProperty(this, "restartSimulation", () => !this.state.config.staticGraph && this.state.simulation.restart());

    if (!this.props.id) {
      (0, _utils.throwErr)(this.constructor.name, _err.default.GRAPH_NO_ID_PROP);
    }

    this.focusAnimationTimeout = null;
    this.nodeClickTimer = null;
    this.isDraggingNode = false;
    this.state = (0, _graph3.initializeGraphState)(this.props, this.state);
    this.debouncedOnZoomChange = this.props.onZoomChange ? (0, _utils.debounce)(this.props.onZoomChange, 100) : null;
  }
  /**
   * @deprecated
   * `componentWillReceiveProps` has a replacement method in react v16.3 onwards.
   * that is getDerivedStateFromProps.
   * But one needs to be aware that if an anti pattern of `componentWillReceiveProps` is
   * in place for this implementation the migration might not be that easy.
   * See {@link https://reactjs.org/blog/2018/06/07/you-probably-dont-need-derived-state.html}.
   * @param {Object} nextProps - props.
   * @returns {undefined}
   */
  // eslint-disable-next-line

  UNSAFE_componentWillReceiveProps(nextProps) {
    const { graphElementsUpdated, newGraphElements } = (0, _graph3.checkForGraphElementsChanges)(nextProps, this.state);
    const state = graphElementsUpdated ? (0, _graph3.initializeGraphState)(nextProps, this.state) : this.state;
    const newConfig = nextProps.config || {};
    const { configUpdated, d3ConfigUpdated } = (0, _graph3.checkForGraphConfigChanges)(nextProps, this.state);
    const config = configUpdated ? (0, _utils.merge)(_graph2.default, newConfig) : this.state.config; // in order to properly update graph data we need to pause eventual d3 ongoing animations

    newGraphElements && this.pauseSimulation();
    const transform =
      newConfig.panAndZoom !== this.state.config.panAndZoom
        ? {
            x: 0,
            y: 0,
            k: 1,
          }
        : this.state.transform;
    const focusedNodeId = nextProps.data.focusedNodeId;
    const d3FocusedNode = this.state.d3Nodes.find(node => `${node.id}` === `${focusedNodeId}`);
    const containerElId = `${this.state.id}-${_graph.default.GRAPH_WRAPPER_ID}`;
    const focusTransformation =
      (0, _graph3.getCenterAndZoomTransformation)(d3FocusedNode, this.state.config, containerElId) ||
      this.state.focusTransformation;
    const enableFocusAnimation = this.props.data.focusedNodeId !== nextProps.data.focusedNodeId; // if we're given a function to call when the zoom changes, we create a debounced version of it
    // this is because this function gets called in very rapid succession when zooming

    if (nextProps.onZoomChange) {
      this.debouncedOnZoomChange = (0, _utils.debounce)(nextProps.onZoomChange, 100);
    }

    this.setState(
      _objectSpread(
        _objectSpread({}, state),
        {},
        {
          config,
          configUpdated,
          d3ConfigUpdated,
          newGraphElements,
          transform,
          focusedNodeId,
          enableFocusAnimation,
          focusTransformation,
        }
      )
    );
  }

  componentDidUpdate() {
    // if the property staticGraph was activated we want to stop possible ongoing simulation
    const shouldPause = this.state.config.staticGraph || this.state.config.staticGraphWithDragAndDrop;

    if (shouldPause) {
      this.pauseSimulation();
    }

    if (!this.state.config.staticGraph && (this.state.newGraphElements || this.state.d3ConfigUpdated)) {
      this._graphBindD3ToReactComponent();

      if (!this.state.config.staticGraphWithDragAndDrop) {
        this.restartSimulation();
      }

      this.setState({
        newGraphElements: false,
        d3ConfigUpdated: false,
      });
    } else if (this.state.configUpdated) {
      this._graphNodeDragConfig();
    }

    if (this.state.configUpdated) {
      this._zoomConfig();

      this.setState({
        configUpdated: false,
      });
    }
  }

  componentDidMount() {
    if (!this.state.config.staticGraph) {
      this._graphBindD3ToReactComponent();
    } // graph zoom and drag&drop all network

    this._zoomConfig();
  }

  componentWillUnmount() {
    this.pauseSimulation();

    if (this.nodeClickTimer) {
      clearTimeout(this.nodeClickTimer);
      this.nodeClickTimer = null;
    }

    if (this.focusAnimationTimeout) {
      clearTimeout(this.focusAnimationTimeout);
      this.focusAnimationTimeout = null;
    }
  }

  render() {
    const { nodes, links, defs } = (0, _graph4.renderGraph)(
      this.state.nodes,
      {
        onClickNode: this.onClickNode,
        onDoubleClickNode: this.onDoubleClickNode,
        onRightClickNode: this.onRightClickNode,
        onMouseOverNode: this.onMouseOverNode,
        onMouseOut: this.onMouseOutNode,
      },
      this.state.d3Links,
      this.state.links,
      {
        onClickLink: this.props.onClickLink,
        onRightClickLink: this.props.onRightClickLink,
        onMouseOverLink: this.onMouseOverLink,
        onMouseOutLink: this.onMouseOutLink,
      },
      this.state.config,
      this.state.highlightedNode,
      this.state.highlightedLink,
      this.state.transform.k
    );
    const svgStyle = {
      height: this.state.config.height,
      width: this.state.config.width,
    };

    const containerProps = this._generateFocusAnimationProps();

    return /*#__PURE__*/ _react.default.createElement(
      "div",
      {
        id: `${this.state.id}-${_graph.default.GRAPH_WRAPPER_ID}`,
      },
      /*#__PURE__*/ _react.default.createElement(
        "svg",
        {
          name: `svg-container-${this.state.id}`,
          style: svgStyle,
          onClick: this.onClickGraph,
        },
        defs,
        /*#__PURE__*/ _react.default.createElement(
          "g",
          _extends(
            {
              id: `${this.state.id}-${_graph.default.GRAPH_CONTAINER_ID}`,
            },
            containerProps
          ),
          links,
          nodes
        )
      )
    );
  }
}

exports.default = Graph;
