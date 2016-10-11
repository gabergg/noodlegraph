import React, { Component, PropTypes } from 'react';
import _ from 'lodash';
import { DragLayer } from 'react-dnd';
import ItemTypes from '../constants/ItemTypes';
import Connection from './Connection';
import DumbConnection from './CustomDragLayer/DumbConnection';
import SVGComponent from './SVGComponent';
import * as CoordinateUtils from '../utils/coordinate';
import getEndingConnectionLocation from '../utils/getEndingConnectionLocation';

const layerStyles = {
  position: 'absolute',
  pointerEvents: 'none',
  zIndex: 100,
  left: 0,
  top: 0,
  width: '100%',
  height: '100%',
};

function getItemStyles(props) {
  const { item, currentOffset, initialOffset, viewport } = props;

  const scaledScene = CoordinateUtils.transformSceneToViewport(item, viewport);

  const xDelta = currentOffset.x - initialOffset.x;
  const yDelta = currentOffset.y - initialOffset.y;

  return {
    position: 'absolute',
    left: scaledScene.x + xDelta,
    top: scaledScene.y + yDelta,
  };
}

function getModifiedScene(props, id) {
  const { currentSourceOffset, initialSourceOffset, item, scenes, viewport } = props;

  const scaledScene = CoordinateUtils.transformSceneToViewport(scenes[id], viewport);

  if (id === item.id) {
    return {
      ...scaledScene,
      x: currentSourceOffset.x,
      y: currentSourceOffset.y,
    };
  } else {
    return {
      ...scaledScene
    }
  }
}

class CustomDragLayer extends Component {
  static propTypes = {
    connections: PropTypes.object,
    currentOffset: PropTypes.shape({
      x: PropTypes.number.isRequired,
      y: PropTypes.number.isRequired,
    }),
    currentSourceOffset: PropTypes.shape({
      x: PropTypes.number.isRequired,
      y: PropTypes.number.isRequired
    }),
    initalOffset: PropTypes.shape({
      x: PropTypes.number.isRequired,
      y: PropTypes.number.isRequired,
    }),
    initialSourceOffset: PropTypes.shape({
      x: PropTypes.number.isRequired,
      y: PropTypes.number.isRequired
    }),
    isDragging: PropTypes.bool.isRequired,
    item: PropTypes.object,
    itemType: PropTypes.string,
    renderScene: PropTypes.func.isRequired,
    renderSceneHeader: PropTypes.func.isRequired,
    scenes: PropTypes.object,
    showConnections: PropTypes.bool.isRequired,
    viewport: PropTypes.object.isRequired,
  };

  static defaultProps = {
    connections: {},
    item: {},
    itemType: "",
    scenes: {},
  };

  getEndingVertOffset = (connection, toScene) => {
    const connsEndingHere = _.sortBy(_.map(_.filter(this.props.connections, (conn, id) => {
      return conn.to === toScene.id;
    }), 'id'));
    return (1 / (connsEndingHere.length + 1)) * (connsEndingHere.indexOf(connection.id) + 1);
  }

  renderConnection(connection) {
    const { currentSourceOffset, initialSourceOffset, item, viewport } = this.props;

    const scaledConnection = CoordinateUtils.transformConnectionToViewport(connection, viewport)

    const fromScene = getModifiedScene(this.props, connection.from);
    const toScene = getModifiedScene(this.props, connection.to);

    const itemIsTarget = item.id === toScene.id;
    const xDelta = currentSourceOffset.x - initialSourceOffset.x;
    const yDelta = currentSourceOffset.y - initialSourceOffset.y;
    const startX = itemIsTarget ?
      scaledConnection.startX :
      scaledConnection.startX + xDelta;
    const startY = itemIsTarget ?
      scaledConnection.startY :
      scaledConnection.startY + yDelta;
    const endingVertOffset = this.getEndingVertOffset(scaledConnection, toScene);

    const endLocation = getEndingConnectionLocation(toScene, fromScene.x < toScene.x, endingVertOffset);

    return <DumbConnection
      key={connection.id}
      startX={startX}
      startY={startY}
      endX={endLocation.x}
      endY={endLocation.y}
    />
  }

  renderNewConnectionBeingDragged = () => {
    const { currentOffset, initialOffset } = this.props;

    return (
      <DumbConnection
        startX={initialOffset.x}
        startY={initialOffset.y}
        endX={currentOffset.x}
        endY={currentOffset.y}
      />
    );
  }

  renderExistingConnectionBeingDragged = (isStart) => {
    const { currentOffset, initialOffset, item, scenes, viewport } = this.props;
    const endScene = CoordinateUtils.transformSceneToViewport(scenes[item.to], viewport);
    const startingLoc = isStart ? currentOffset : {x: item.startX, y: item.startY}
    const endingVertOffset = this.getEndingVertOffset(item, endScene);
    const endingLoc = isStart ? getEndingConnectionLocation(endScene, initialOffset.x < endScene.x, endingVertOffset) : currentOffset;

    return (
      <DumbConnection
        startX={startingLoc.x}
        startY={startingLoc.y}
        endX={endingLoc.x}
        endY={endingLoc.y}
      />
    );
  }

  render() {
    const {
      connections,
      currentSourceOffset,
      isDragging,
      initialSourceOffset,
      item,
      itemType,
      renderScene,
      renderSceneHeader,
      showConnections,
      viewport,
    } = this.props;

    if (!isDragging || !currentSourceOffset || !initialSourceOffset) {
      return null;
    }

    if(itemType === ItemTypes.NEW_CONNECTION) {
      return this.renderNewConnectionBeingDragged();
    } else if (itemType === ItemTypes.CONNECTION_START) {
      return this.renderExistingConnectionBeingDragged(true);
    } else if (itemType === ItemTypes.CONNECTION_END) {
      return this.renderExistingConnectionBeingDragged(false);
    }

    const connectionsInMotion = _.filter(connections, (connection) => {
      return [connection.from, connection.to].includes(item.id);
    });

    const itemStyle = getItemStyles(this.props);
    const renderData = {id: item.id, scale: viewport.scale};
    return (
      <div style={layerStyles}>
        <div style={itemStyle}>
          {renderSceneHeader(renderData)}
          {renderScene(renderData)}
        </div>
          {showConnections && Object.keys(connectionsInMotion)
            .map(key => this.renderConnection(connectionsInMotion[key]))
          }
      </div>
    );
  }
}

export default DragLayer(monitor => ({
  item: monitor.getItem(),
  itemType: monitor.getItemType(),
  initialOffset: monitor.getInitialClientOffset(),
  initialSourceOffset: monitor.getInitialSourceClientOffset(),
  currentOffset: monitor.getClientOffset(),
  currentSourceOffset: monitor.getSourceClientOffset(),
  isDragging: monitor.isDragging()
}))(CustomDragLayer)
