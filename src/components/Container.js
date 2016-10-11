import React, { Component, PropTypes } from 'react';
import { DropTarget } from 'react-dnd';
import shouldPureComponentUpdate from '../utils/shouldPureComponentUpdate';
import update from 'react/lib/update';
import ItemTypes from '../constants/ItemTypes';
import Connection from './Connection';
import Pan from './Pan';
import DraggableScene from './DraggableScene';
import * as CoordinateUtils from '../utils/coordinate';
import _ from 'lodash';

const containerStyles = {
  position: 'relative',
  width: '100%',
  height: '100%',
  left: 0,
  top: 0,
};

class Container extends Component {
  static propTypes = {
    connectDropTarget: PropTypes.func.isRequired,
    connections: PropTypes.object,
    onDragConnectionEnd: PropTypes.func.isRequired,
    onDragConnectionStart: PropTypes.func.isRequired,
    onDragSceneEnd: PropTypes.func.isRequired,
    onTargetlessConnectionDrop: PropTypes.func.isRequired,
    renderScene: PropTypes.func.isRequired,
    renderSceneHeader: PropTypes.func.isRequired,
    scenes: PropTypes.object,
    showConnections: PropTypes.bool.isRequired,
    updateScene: PropTypes.func.isRequired,
    updateConnectionEnd: PropTypes.func.isRequired,
    updateConnectionStart: PropTypes.func.isRequired,
    viewport: PropTypes.object.isRequired,
  };

  static defaultProps = {
    connections: {},
    scenes: {},
  };

  state = {
    draggedConnection: {},
    draggedScene: {},
    currentConnectionOrigin: null,
    currentConnectionBox: null,
    sceneHeaderHeight: 0,
  };

  getScaledConnection = (connection) => {
    const {viewport} = this.props;

    return {
      ...connection,
      startX: viewport.scale * (connection.startX + viewport.x + viewport.width / 2),
      startY: viewport.scale * (connection.startY + viewport.y + viewport.height / 2),
    };
  };

  getEndingVertOffset = (connection, toScene) => {
    const connsEndingHere = _.sortBy(_.map(_.filter(this.props.connections, (conn, id) => {
      return conn.to === toScene.id;
    }), 'id'));
    return (1 / (connsEndingHere.length + 1)) * (connsEndingHere.indexOf(connection.id) + 1);
  }

  handleConnectionDragChange = (draggedConnection, isStartingDrag) => {
    this.setState({
      draggedConnection: isStartingDrag ? draggedConnection : {},
    });
  }

  handleDragConnectionStart = (scene, clickAbsolutePosition) => {
    const { onDragConnectionStart, viewport } = this.props;
    const { sceneHeaderHeight } = this.state;
    const clickRelativePosition = {
      x: clickAbsolutePosition.x - scene.x - viewport.x,
      y: clickAbsolutePosition.y - scene.y - viewport.y - sceneHeaderHeight,
    };
    const relativeStartLocation = onDragConnectionStart(scene, clickRelativePosition);
    const absoluteStartLocation = _.isEmpty(relativeStartLocation) ? null :
      {
        x: relativeStartLocation.x + scene.x + viewport.x,
        y: relativeStartLocation.y + scene.y + viewport.y + sceneHeaderHeight,
      };

    this.setState({
      currentConnectionOrigin: absoluteStartLocation,
    });
    return absoluteStartLocation;
  }

  handleSceneDragChange = (draggedSceneId, isStartingDrag, delta) => {
    const { scenes } = this.props;
    const draggedScene = scenes[draggedSceneId];

    this.setState({
      draggedScene: isStartingDrag ? draggedScene : {},
    });
  }

  handleSceneHeaderRef = (sceneHeaderHeight) => {
    if(sceneHeaderHeight !== this.state.sceneHeaderHeight){
      this.setState({sceneHeaderHeight});
    }
  }

  renderConnection(connection) {
    const { onTargetedConnectionDrop, onTargetlessConnectionDrop, scenes, viewport } = this.props;
    const { draggedConnection, draggedScene } = this.state;
    const fromScene = CoordinateUtils.transformScene(scenes[connection.from], viewport);
    const toScene = CoordinateUtils.transformScene(scenes[connection.to], viewport);
    if ([fromScene.id, toScene.id].includes(draggedScene.id) ||
        connection.id === draggedConnection.id) {
      return null;
    }
    const endingVertOffset = this.getEndingVertOffset(connection, toScene);

    connection = this.getScaledConnection(connection);

    return (
      <Connection
        connection={connection}
        endingScene={toScene}
        endingVertOffset={endingVertOffset}
        key={connection.id}
        onConnectionDragChange={this.handleConnectionDragChange}
        onTargetlessConnectionDrop={onTargetlessConnectionDrop}
      />
    );
  }

  renderDraggableScene(scene) {
    const {
      onDragConnectionEnd,
      onDragConnectionStart,
      onTargetlessConnectionDrop,
      renderScene,
      renderSceneHeader,
      updateConnectionEnd,
      updateConnectionStart,
      viewport,
    } = this.props;

    const { currentConnectionOrigin, draggedScene } = this.state;

    if (draggedScene.id === scene.id)
      return null

    const scaledScene = CoordinateUtils.transformScene(scene, viewport)

    return (
      <DraggableScene
        connectionLocation={currentConnectionOrigin}
        key={scene.id}
        onDragConnectionEnd={onDragConnectionEnd}
        onDragConnectionStart={this.handleDragConnectionStart}
        onSceneDragChange={this.handleSceneDragChange}
        onSceneHeaderRef={this.handleSceneHeaderRef}
        onTargetlessConnectionDrop={onTargetlessConnectionDrop}
        renderScene={renderScene}
        renderSceneHeader={renderSceneHeader}
        scaledScene={scaledScene}
        scene={scene}
        scale={viewport.scale}
        updateConnectionEnd={updateConnectionEnd}
        updateConnectionStart={updateConnectionStart}
      />
    );
  }

  render() {
    const {
      connectDropTarget,
      connections,
      scenes,
      showConnections,
      viewport,
      handlePanStart,
      handlePanMove,
      handlePanEnd,
      cursor,
    } = this.props;

    const viewportStyle = {
      position: 'absolute',
      overflow: 'hidden',
      width: viewport.width * viewport.scale,
      height: viewport.height * viewport.scale,
      cursor,
    };

    return connectDropTarget(
      <div
        style={containerStyles}
        onMouseDown={handlePanStart}
        onMouseMove={handlePanMove}
        onMouseUp={handlePanEnd}
      >
        <div style={viewportStyle}>
          {Object.keys(scenes)
            .map(key => this.renderDraggableScene(scenes[key]))
          }
          {showConnections && Object.keys(connections)
            .map(key => this.renderConnection(connections[key]))
          }
        </div>
      </div>
    );
  }
}

const onDrop = (props, monitor) => {
  const delta = monitor.getDifferenceFromInitialOffset()
  const scene = monitor.getItem()

  props.onDragSceneEnd(scene, delta);
}

export default DropTarget(ItemTypes.SCENE, {drop: onDrop}, connect => ({
  connectDropTarget: connect.dropTarget()
}))(Pan(Container))
