"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true,
});
exports.checkForGraphConfigChanges = checkForGraphConfigChanges;
exports.checkForGraphElementsChanges = checkForGraphElementsChanges;
exports.getCenterAndZoomTransformation = getCenterAndZoomTransformation;
exports.getId = getId;
exports.initializeGraphState = initializeGraphState;
exports.updateNodeHighlightedValue = updateNodeHighlightedValue;
exports.getNormalizedNodeCoordinates = getNormalizedNodeCoordinates;
exports.initializeNodes = initializeNodes;
exports.isPositionInBounds = isPositionInBounds;

var _d3Force = require("d3-force");

var _d3Selection = require("d3-selection");

var _d3Zoom = require("d3-zoom");

var _graph = _interopRequireDefault(require("./graph.const"));

var _graph2 = _interopRequireDefault(require("./graph.config"));

var _err = _interopRequireDefault(require("../../err"));

var _utils = require("../../utils");

var _collapse = require("./collapse.helper");

function _interopRequireDefault(obj) {
  return obj && obj.__esModule ? obj : { default: obj };
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

const NODE_PROPS_WHITELIST = ["id", "highlighted", "x", "y", "index", "vy", "vx"];
const LINK_PROPS_WHITELIST = ["index", "source", "target", "isHidden"];
/**
 * Create d3 forceSimulation to be applied on the graph.<br/>
 * {@link https://github.com/d3/d3-force#forceSimulation|d3-force#forceSimulation}<br/>
 * {@link https://github.com/d3/d3-force#simulation_force|d3-force#simulation_force}<br/>
 * Wtf is a force? {@link https://github.com/d3/d3-force#forces| here}
 * @param  {number} width - the width of the container area of the graph.
 * @param  {number} height - the height of the container area of the graph.
 * @param  {number} gravity - the force strength applied to the graph.
 * @returns {Object} returns the simulation instance to be consumed.
 * @memberof Graph/helper
 */

function _createForceSimulation(width, height, gravity) {
  const frx = (0, _d3Force.forceX)(width / 2).strength(_graph.default.FORCE_X);
  const fry = (0, _d3Force.forceY)(height / 2).strength(_graph.default.FORCE_Y);
  const forceStrength = gravity;
  return (0, _d3Force.forceSimulation)()
    .force("charge", (0, _d3Force.forceManyBody)().strength(forceStrength))
    .force("x", frx)
    .force("y", fry);
}
/**
 * Receives a matrix of the graph with the links source and target as concrete node instances and it transforms it
 * in a lightweight matrix containing only links with source and target being strings representative of some node id
 * and the respective link value (if non existent will default to 1).
 * @param  {Array.<Link>} graphLinks - an array of all graph links.
 * @param  {Object} config - the graph config.
 * @returns {Object.<string, Object>} an object containing a matrix of connections of the graph, for each nodeId,
 * there is an object that maps adjacent nodes ids (string) and their values (number).
 * @memberof Graph/helper
 */

function _initializeLinks(graphLinks, config) {
  return graphLinks.reduce((links, l) => {
    const source = getId(l.source);
    const target = getId(l.target);

    if (!links[source]) {
      links[source] = {};
    }

    if (!links[target]) {
      links[target] = {};
    }

    const value = config.collapsible && l.isHidden ? 0 : l.value || 1;
    links[source][target] = value;

    if (!config.directed) {
      links[target][source] = value;
    }

    return links;
  }, {});
}
/**
 * Method that initialize graph nodes provided by rd3g consumer and adds additional default mandatory properties
 * that are optional for the user. Also it generates an index mapping, this maps nodes ids the their index in the array
 * of nodes. This is needed because d3 callbacks such as node click and link click return the index of the node.
 * @param  {Array.<Node>} graphNodes - the array of nodes provided by the rd3g consumer.
 * @returns {Object.<string, Object>} returns the nodes ready to be used within rd3g with additional properties such as x, y
 * and highlighted values.
 * @memberof Graph/helper
 */

function initializeNodes(graphNodes) {
  let nodes = {};
  const n = graphNodes.length;

  for (let i = 0; i < n; i++) {
    const node = graphNodes[i];
    node.highlighted = false; // if an fx (forced x) is given, we want to use that

    if (Object.prototype.hasOwnProperty.call(node, "fx")) {
      node.x = node.fx;
    } else if (!Object.prototype.hasOwnProperty.call(node, "x")) {
      node.x = 0;
    } // if an fy (forced y) is given, we want to use that

    if (Object.prototype.hasOwnProperty.call(node, "fy")) {
      node.y = node.fy;
    } else if (!Object.prototype.hasOwnProperty.call(node, "y")) {
      node.y = 0;
    }

    nodes[node.id.toString()] = node;
  }

  return nodes;
}
/**
 * Maps an input link (with format `{ source: 'sourceId', target: 'targetId' }`) to a d3Link
 * (with format `{ source: { id: 'sourceId' }, target: { id: 'targetId' } }`). If d3Link with
 * given index exists already that same d3Link is returned.
 * @param {Object} link - input link.
 * @param {number} index - index of the input link.
 * @param {Array.<Object>} d3Links - all d3Links.
 * @param  {Object} config - same as {@link #graphrenderer|config in renderGraph}.
 * @param {Object} state - Graph component current state (same format as returned object on this function).
 * @returns {Object} a d3Link.
 * @memberof Graph/helper
 */

function _mergeDataLinkWithD3Link(link, index, d3Links = [], config, state = {}) {
  // find the matching link if it exists
  const tmp = d3Links.find(l => l.source.id === link.source && l.target.id === link.target);
  const d3Link = tmp && (0, _utils.pick)(tmp, LINK_PROPS_WHITELIST);
  const customProps = (0, _utils.antiPick)(link, ["source", "target"]);

  if (d3Link) {
    const toggledDirected =
      state.config &&
      Object.prototype.hasOwnProperty.call(state.config, "directed") &&
      config.directed !== state.config.directed;

    const refinedD3Link = _objectSpread(
      _objectSpread(
        {
          index,
        },
        d3Link
      ),
      customProps
    ); // every time we toggle directed config all links should be visible again

    if (toggledDirected) {
      return _objectSpread(
        _objectSpread({}, refinedD3Link),
        {},
        {
          isHidden: false,
        }
      );
    } // every time we disable collapsible (collapsible is false) all links should be visible again

    return config.collapsible
      ? refinedD3Link
      : _objectSpread(
          _objectSpread({}, refinedD3Link),
          {},
          {
            isHidden: false,
          }
        );
  }

  const highlighted = false;
  const source = {
    id: link.source,
    highlighted,
  };
  const target = {
    id: link.target,
    highlighted,
  };
  return _objectSpread(
    {
      index,
      source,
      target,
    },
    customProps
  );
}
/**
 * Tags orphan nodes with a `_orphan` flag.
 * @param {Object.<string, Object>} nodes - nodes mapped by their id.
 * @param {Object.<string, Object>} linksMatrix - an object containing a matrix of connections of the graph, for each nodeId,
 * there is an object that maps adjacent nodes ids (string) and their values (number).
 * @returns {Object.<string, Object>} same input nodes structure with tagged orphans nodes where applicable.
 * @memberof Graph/helper
 */

function _tagOrphanNodes(nodes, linksMatrix) {
  return Object.keys(nodes).reduce((acc, nodeId) => {
    const { inDegree, outDegree } = (0, _collapse.computeNodeDegree)(nodeId, linksMatrix);
    const node = nodes[nodeId];
    const taggedNode =
      inDegree === 0 && outDegree === 0
        ? _objectSpread(
            _objectSpread({}, node),
            {},
            {
              _orphan: true,
            }
          )
        : node;
    acc[nodeId] = taggedNode;
    return acc;
  }, {});
}
/**
 * Some integrity validations on links and nodes structure. If some validation fails the function will
 * throw an error.
 * @param  {Object} data - Same as {@link #initializeGraphState|data in initializeGraphState}.
 * @throws can throw the following error or warning msg:
 * INSUFFICIENT_DATA - msg if no nodes are provided
 * INVALID_LINKS - if links point to nonexistent nodes
 * INSUFFICIENT_LINKS - if no links are provided (not even empty Array)
 * @returns {undefined}
 * @memberof Graph/helper
 */

function _validateGraphData(data) {
  if (!data.nodes || !data.nodes.length) {
    (0, _utils.logWarning)("Graph", _err.default.INSUFFICIENT_DATA);
    data.nodes = [];
  }

  if (!data.links) {
    (0, _utils.logWarning)("Graph", _err.default.INSUFFICIENT_LINKS);
    data.links = [];
  }

  const n = data.links.length;

  for (let i = 0; i < n; i++) {
    const l = data.links[i];

    if (!data.nodes.find(n => n.id === l.source)) {
      (0, _utils.throwErr)("Graph", `${_err.default.INVALID_LINKS} - "${l.source}" is not a valid source node id`);
    }

    if (!data.nodes.find(n => n.id === l.target)) {
      (0, _utils.throwErr)("Graph", `${_err.default.INVALID_LINKS} - "${l.target}" is not a valid target node id`);
    }

    if (l && l.value !== undefined && typeof l.value !== "number") {
      (0, _utils.throwErr)(
        "Graph",
        `${_err.default.INVALID_LINK_VALUE} - found in link with source "${l.source}" and target "${l.target}"`
      );
    }
  }
} // list of properties that are of no interest when it comes to nodes and links comparison

const NODE_PROPERTIES_DISCARD_TO_COMPARE = ["x", "y", "vx", "vy", "index"];
/**
 * Picks the id.
 * @param {Object} o object to pick from.
 * @returns {Object} new object with id property only.
 * @memberof Graph/helper
 */

function _pickId(o) {
  return (0, _utils.pick)(o, ["id"]);
}
/**
 * Picks source and target.
 * @param {Object} o object to pick from.
 * @returns {Object} new object with source and target only.
 * @memberof Graph/helper
 */

function _pickSourceAndTarget(o) {
  return (0, _utils.pick)(o, ["source", "target"]);
}
/**
 * This function checks for graph elements (nodes and links) changes, in two different
 * levels of significance, updated elements (whether some property has changed in some
 * node or link) and new elements (whether some new elements or added/removed from the graph).
 * @param {Object} nextProps - nextProps that graph will receive.
 * @param {Object} currentState - the current state of the graph.
 * @returns {Object.<string, boolean>} returns object containing update check flags:
 * - newGraphElements - flag that indicates whether new graph elements were added.
 * - graphElementsUpdated - flag that indicates whether some graph elements have
 * updated (some property that is not in NODE_PROPERTIES_DISCARD_TO_COMPARE was added to
 * some node or link or was updated).
 * @memberof Graph/helper
 */

function checkForGraphElementsChanges(nextProps, currentState) {
  const nextNodes = nextProps.data.nodes.map(n => (0, _utils.antiPick)(n, NODE_PROPERTIES_DISCARD_TO_COMPARE));
  const nextLinks = nextProps.data.links;
  const stateD3Nodes = currentState.d3Nodes.map(n => (0, _utils.antiPick)(n, NODE_PROPERTIES_DISCARD_TO_COMPARE));
  const stateD3Links = currentState.d3Links.map(l => ({
    source: getId(l.source),
    target: getId(l.target),
  }));
  const graphElementsUpdated = !(
    (0, _utils.isDeepEqual)(nextNodes, stateD3Nodes) && (0, _utils.isDeepEqual)(nextLinks, stateD3Links)
  );
  const newGraphElements =
    nextNodes.length !== stateD3Nodes.length ||
    nextLinks.length !== stateD3Links.length ||
    !(0, _utils.isDeepEqual)(nextNodes.map(_pickId), stateD3Nodes.map(_pickId)) ||
    !(0, _utils.isDeepEqual)(nextLinks.map(_pickSourceAndTarget), stateD3Links.map(_pickSourceAndTarget));
  return {
    graphElementsUpdated,
    newGraphElements,
  };
}
/**
 * Logic to check for changes in graph config.
 * @param {Object} nextProps - nextProps that graph will receive.
 * @param {Object} currentState - the current state of the graph.
 * @returns {Object.<string, boolean>} returns object containing update check flags:
 * - configUpdated - global flag that indicates if any property was updated.
 * - d3ConfigUpdated - specific flag that indicates changes in d3 configurations.
 * @memberof Graph/helper
 */

function checkForGraphConfigChanges(nextProps, currentState) {
  const newConfig = nextProps.config || {};
  const configUpdated =
    newConfig && !(0, _utils.isEmptyObject)(newConfig) && !(0, _utils.isDeepEqual)(newConfig, currentState.config);
  const d3ConfigUpdated = newConfig && newConfig.d3 && !(0, _utils.isDeepEqual)(newConfig.d3, currentState.config.d3);
  return {
    configUpdated,
    d3ConfigUpdated,
  };
}
/**
 * Returns the transformation to apply in order to center the graph on the
 * selected node.
 * @param {Object} d3Node - node to focus the graph view on.
 * @param {Object} config - same as {@link #graphrenderer|config in renderGraph}.
 * @param {string} containerElId - ID of container element
 * @returns {string|undefined} transform rule to apply.
 * @memberof Graph/helper
 */

function getCenterAndZoomTransformation(d3Node, config, containerElId) {
  if (!d3Node) {
    return;
  }

  const { width, height, focusZoom } = config;
  const selector = (0, _d3Selection.select)(`#${containerElId}`); // in order to initialize the new position

  selector.call(
    (0, _d3Zoom.zoom)().transform,
    _d3Zoom.zoomIdentity
      .translate(width / 2, height / 2)
      .scale(focusZoom)
      .translate(-d3Node.x, -d3Node.y)
  );
  return `
    translate(${width / 2}, ${height / 2})
    scale(${focusZoom})
    translate(${-d3Node.x}, ${-d3Node.y})
  `;
}
/**
 * This function extracts an id from a link.
 * **Why this function?**
 * According to [d3-force](https://github.com/d3/d3-force#link_links)
 * d3 links might be initialized with "source" and "target"
 * properties as numbers or strings, but after initialization they
 * are converted to an object. This small utility functions ensures
 * that weather in initialization or further into the lifetime of the graph
 * we always get the id.
 * @param {Object|string|number} sot source or target
 * of the link to extract id.
 * we want to extract an id.
 * @returns {string|number} the id of the link.
 * @memberof Graph/helper
 */

function getId(sot) {
  return sot.id !== undefined && sot.id !== null ? sot.id : sot;
}
/**
 * Encapsulates common procedures to initialize graph.
 * @param {Object} props - Graph component props, object that holds data, id and config.
 * @param {Object} props.data - Data object holds links (array of **Link**) and nodes (array of **Node**).
 * @param {string} props.id - the graph id.
 * @param {Object} props.config - same as {@link #graphrenderer|config in renderGraph}.
 * @param {Object} state - Graph component current state (same format as returned object on this function).
 * @returns {Object} a fully (re)initialized graph state object.
 * @memberof Graph/helper
 */

function initializeGraphState({ data, id, config }, state) {
  _validateGraphData(data);

  let graph;

  if (state && state.nodes) {
    graph = {
      nodes: data.nodes.map(n =>
        state.nodes[n.id]
          ? _objectSpread(_objectSpread({}, n), (0, _utils.pick)(state.nodes[n.id], NODE_PROPS_WHITELIST))
          : _objectSpread({}, n)
      ),
      links: data.links.map((l, index) => _mergeDataLinkWithD3Link(l, index, state && state.d3Links, config, state)),
    };
  } else {
    graph = {
      nodes: data.nodes.map(n => _objectSpread({}, n)),
      links: data.links.map(l => _objectSpread({}, l)),
    };
  }

  let newConfig = _objectSpread({}, (0, _utils.merge)(_graph2.default, config || {})),
    links = _initializeLinks(graph.links, newConfig),
    // matrix of graph connections
    nodes = _tagOrphanNodes(initializeNodes(graph.nodes), links);

  const { nodes: d3Nodes, links: d3Links } = graph;
  const formatedId = id.replace(/ /g, "_");

  const simulation = _createForceSimulation(newConfig.width, newConfig.height, newConfig.d3 && newConfig.d3.gravity);

  const { minZoom, maxZoom, focusZoom } = newConfig;

  if (focusZoom > maxZoom) {
    newConfig.focusZoom = maxZoom;
  } else if (focusZoom < minZoom) {
    newConfig.focusZoom = minZoom;
  }

  return {
    id: formatedId,
    config: newConfig,
    links,
    d3Links,
    nodes,
    d3Nodes,
    highlightedNode: "",
    simulation,
    newGraphElements: false,
    configUpdated: false,
    transform: {
      x: 0,
      y: 0,
      k: 1,
    },
    draggedNode: null,
  };
}
/**
 * This function updates the highlighted value for a given node and also updates highlight props.
 * @param {Object.<string, Object>} nodes - an object containing all nodes mapped by their id.
 * @param {Object.<string, Object>} links - an object containing a matrix of connections of the graph.
 * @param {Object} config - an object containing rd3g consumer defined configurations {@link #config config} for the graph.
 * @param {string} id - identifier of node to update.
 * @param {string} value - new highlight value for given node.
 * @returns {Object} returns an object containing the updated nodes
 * and the id of the highlighted node.
 * @memberof Graph/helper
 */

function updateNodeHighlightedValue(nodes, links, config, id, value = false) {
  const highlightedNode = value ? id : "";

  const node = _objectSpread(
    _objectSpread({}, nodes[id]),
    {},
    {
      highlighted: value,
    }
  );

  let updatedNodes = _objectSpread(
    _objectSpread({}, nodes),
    {},
    {
      [id]: node,
    }
  ); // when highlightDegree is 0 we want only to highlight selected node

  if (links[id] && config.highlightDegree !== 0) {
    updatedNodes = Object.keys(links[id]).reduce((acc, linkId) => {
      const updatedNode = _objectSpread(
        _objectSpread({}, updatedNodes[linkId]),
        {},
        {
          highlighted: value,
        }
      );

      acc[linkId] = updatedNode;
      return acc;
    }, updatedNodes);
  }

  return {
    nodes: updatedNodes,
    highlightedNode,
  };
}
/**
 * Computes the normalized vector from a vector.
 * @param {Object} vector a 2D vector with x and y components
 * @param {number} vector.x x coordinate
 * @param {number} vector.y y coordinate
 * @returns {Object} normalized vector
 * @memberof Graph/helper
 */

function normalize(vector) {
  const norm = Math.sqrt(Math.pow(vector.x, 2) + Math.pow(vector.y, 2));
  return norm === 0
    ? vector
    : {
        x: vector.x / norm,
        y: vector.y / norm,
      };
}

const SYMBOLS_WITH_OPTIMIZED_POSITIONING = new Set([_graph.default.SYMBOLS.CIRCLE]);
/**
 * Computes new node coordinates to make arrowheads point at nodes.
 * Arrow configuration is only available for circles.
 * @param {Object} info - the couple of nodes we need to compute new coordinates
 * @param {string} info.sourceId - node source id
 * @param {string} info.targetId - node target id
 * @param {Object} info.sourceCoords - node source coordinates
 * @param {Object} info.targetCoords - node target coordinates
 * @param {Object.<string, Object>} nodes - same as {@link #graphrenderer|nodes in renderGraph}.
 * @param {Object} config - same as {@link #graphrenderer|config in renderGraph}.
 * @param {number} strokeWidth width of the link stroke
 * @returns {Object} new nodes coordinates
 * @memberof Graph/helper
 */

function getNormalizedNodeCoordinates(
  { sourceId, targetId, sourceCoords = {}, targetCoords = {} },
  nodes,
  config,
  strokeWidth
) {
  var _config$node, _config$node2, _config$node3;

  const sourceNode = nodes === null || nodes === void 0 ? void 0 : nodes[sourceId];
  const targetNode = nodes === null || nodes === void 0 ? void 0 : nodes[targetId];

  if (!sourceNode || !targetNode) {
    return {
      sourceCoords,
      targetCoords,
    };
  }

  if (
    ((_config$node = config.node) === null || _config$node === void 0 ? void 0 : _config$node.viewGenerator) ||
    (sourceNode === null || sourceNode === void 0 ? void 0 : sourceNode.viewGenerator) ||
    (targetNode === null || targetNode === void 0 ? void 0 : targetNode.viewGenerator)
  ) {
    return {
      sourceCoords,
      targetCoords,
    };
  }

  const sourceSymbolType =
    sourceNode.symbolType ||
    ((_config$node2 = config.node) === null || _config$node2 === void 0 ? void 0 : _config$node2.symbolType);
  const targetSymbolType =
    targetNode.symbolType ||
    ((_config$node3 = config.node) === null || _config$node3 === void 0 ? void 0 : _config$node3.symbolType);

  if (
    !SYMBOLS_WITH_OPTIMIZED_POSITIONING.has(sourceSymbolType) &&
    !SYMBOLS_WITH_OPTIMIZED_POSITIONING.has(targetSymbolType)
  ) {
    // if symbols don't have optimized positioning implementations fallback to input coords
    return {
      sourceCoords,
      targetCoords,
    };
  }

  let { x: x1, y: y1 } = sourceCoords;
  let { x: x2, y: y2 } = targetCoords;
  const directionVector = normalize({
    x: x2 - x1,
    y: y2 - y1,
  });

  switch (sourceSymbolType) {
    case _graph.default.SYMBOLS.CIRCLE: {
      let sourceNodeSize =
        (sourceNode === null || sourceNode === void 0 ? void 0 : sourceNode.size) || config.node.size; // because this is a circle and A = pi * r^2
      // we multiply by 0.95, because if we don't the link is not melting properly

      sourceNodeSize = Math.sqrt(sourceNodeSize / Math.PI) * 0.95; // points from the sourceCoords, we move them not to begin in the circle but outside

      x1 += sourceNodeSize * directionVector.x;
      y1 += sourceNodeSize * directionVector.y;
      break;
    }
  }

  switch (targetSymbolType) {
    case _graph.default.SYMBOLS.CIRCLE: {
      var _config$link, _config$link2;

      // it's fine `markerWidth` or `markerHeight` we just want to fallback to a number
      // to avoid NaN on `Math.min(undefined, undefined) > NaN
      let strokeSize =
        strokeWidth *
        Math.min(
          ((_config$link = config.link) === null || _config$link === void 0 ? void 0 : _config$link.markerWidth) || 0,
          ((_config$link2 = config.link) === null || _config$link2 === void 0 ? void 0 : _config$link2.markerHeight) ||
            0
        );
      let targetNodeSize =
        (targetNode === null || targetNode === void 0 ? void 0 : targetNode.size) || config.node.size; // because this is a circle and A = pi * r^2
      // we multiply by 0.95, because if we don't the link is not melting properly

      targetNodeSize = Math.sqrt(targetNodeSize / Math.PI) * 0.95; // points from the targetCoords, we move the by the size of the radius of the circle + the size of the arrow

      x2 -= (targetNodeSize + (config.directed ? strokeSize : 0)) * directionVector.x;
      y2 -= (targetNodeSize + (config.directed ? strokeSize : 0)) * directionVector.y;
      break;
    }
  }

  return {
    sourceCoords: {
      x: x1,
      y: y1,
    },
    targetCoords: {
      x: x2,
      y: y2,
    },
  };
}
/**
 * Checks if the position is inside the viewport bounds
 * @param {{x: number, y: number}} position node's position
 * @param {Object} currentState - the current state of the graph.
 * @returns {boolean} true if the position is inside the viewport else false
 */

function isPositionInBounds(position, currentState) {
  const { transform, config } = currentState;
  const invertTransformZoom = 1 / transform.k;
  return (
    position.x > -transform.x * invertTransformZoom &&
    position.x < (config.width - transform.x) * invertTransformZoom &&
    position.y > -transform.y * invertTransformZoom &&
    position.y < (config.height - transform.y) * invertTransformZoom
  );
}
