import React, { Component, PropTypes } from 'react'
import update from 'react/lib/update';
import { DragDropContext } from 'react-dnd'
import HTML5Backend from 'react-dnd-html5-backend'
import CustomDragLayer from './CustomDragLayer'
import Container from './Container'
import getUUID from '../utils/getUUID';

class SceneGraph extends Component {
  static propTypes = {
    onChange: PropTypes.func.isRequired,
    onDragConnectionStart: PropTypes.func.isRequired,
    renderScene: PropTypes.func.isRequired,
    renderSceneHeader: PropTypes.func.isRequired,
    data: PropTypes.object,
    onConnectionChange: PropTypes.func,
    showConnections: PropTypes.bool,
  }

  static defaultProps = {
    data: {},
    showConnections: true,
    onConnectionChange: () => {},
  };

  handleDragConnectionEnd = (sourceScene, sourceInitialOffset, targetScene) => {
    const { data, onChange, onConnectionChange } = this.props;
    let newConnections = {
      ...data.connections
    };
    const connectionId = getUUID();
    newConnections[connectionId] = {
      from: sourceScene.id,
      id: connectionId,
      label: 'onPress',
      startX: sourceInitialOffset.x,
      startY: sourceInitialOffset.y,
      to: targetScene.id,
    };

    onConnectionChange('create', {
      [connectionId]: newConnections[connectionId]
    });
    onChange(update(data, {
      connections: { $set: newConnections },
    }));
  }

  handleDragSceneEnd = (scene, delta) => {
    const { data, onChange, onConnectionChange } = this.props;
    const updatedConnections = []
    const newConnections = _.mapValues(data.connections, (connection) => {
      if (connection.from === scene.id) {
        const updatedConnection = {
          ...connection,
          startX: connection.startX + delta.x,
          startY: connection.startY + delta.y,
        };
        updatedConnections[connection.id] = updatedConnection;
        return updatedConnection;
      } else {
        return connection;
      }
    });

    if (updatedConnections.length)
      onConnectionChange('update', updatedConnections);
    onChange(update(data, {
      scenes: {
        [scene.id]: {
          x: { $set: scene.x + delta.x },
          y: { $set: scene.y + delta.y },
        },
      },
      connections: { $set: newConnections },
    }));
  }

  handleUpdateConnectionStart = (id, newLocation, newStartSceneId) => {
    const { data, onChange, onConnectionChange } = this.props;
    const oldConnection = data.connections[id];
    if (oldConnection.from === newStartSceneId &&
      oldConnection.startX === newLocation.x &&
      oldConnection.startY === newLocation.y)
      return;
    onConnectionChange('update', {
      [id]: {
        ...oldConnection,
        from: newStartSceneId,
        startX: newLocation.x,
        startY: newLocation.y,
      }
    })
    onChange(update(this.props.data, {
      connections: {
        [id]: {
          from: { $set: newStartSceneId },
          startX: { $set: newLocation.x },
          startY: { $set: newLocation.y },
        },
      }
    }));
  }

  handleUpdateConnectionEnd = (id, newEndSceneId) => {
    const { data, onChange, onConnectionChange } = this.props;
    const oldConnection = data.connections[id];
    if (oldConnection.to === newEndSceneId)
      return;
    onConnectionChange('update', {
      [id]: {
        ...oldConnection,
        to: newEndSceneId,
      }
    });
    onChange(update(data, {
      connections: {
        [id]: {
          to: { $set: newEndSceneId },
        },
      }
    }));
  }

  handleUpdateScene = (id, pos) => {
    const { data, onChange } = this.props;
    const oldScene = data.scenes[id];
    if(oldScene.x === pos.x && oldScene.y === pos.y)
      return;
    onChange(update(data, {
      scenes: {
        [id]: {
          x: { $set: pos.x },
          y: { $set: pos.y },
        },
      }
    }));
  }

  handleRemoveConnection = (id) => {
    const { data, onConnectionChange, onChange } = this.props;
    onConnectionChange('delete', {
      [id]: data.connections[id],
    })
    onChange(update(this.props.data, {
      connections: {
        $set: _.omit(data.connections, id),
      },
    }));
  }

  render() {
    const {
      data,
      onDragConnectionStart,
      renderScene,
      renderSceneHeader,
      showConnections,
    } = this.props

    return (
      <div>
        <Container
          connections={data.connections}
          onDragConnectionEnd={this.handleDragConnectionEnd}
          onDragConnectionStart={onDragConnectionStart}
          onDragSceneEnd={this.handleDragSceneEnd}
          onTargetlessConnectionDrop={this.handleRemoveConnection}
          renderScene={renderScene}
          renderSceneHeader={renderSceneHeader}
          scenes={data.scenes}
          showConnections={showConnections}
          updateConnectionStart={this.handleUpdateConnectionStart}
          updateConnectionEnd={this.handleUpdateConnectionEnd}
          updateScene={this.handleUpdateScene}
          viewport={data.viewport}
        />
        <CustomDragLayer
          connections={data.connections}
          renderScene={renderScene}
          renderSceneHeader={renderSceneHeader}
          scenes={data.scenes}
          showConnections={showConnections}
          viewport={data.viewport}
        />
      </div>
    )
  }
}

export default DragDropContext(HTML5Backend)(SceneGraph)
