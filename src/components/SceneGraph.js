import React, { Component, PropTypes } from 'react'
import update from 'react/lib/update';
import { DragDropContext } from 'react-dnd'
import HTML5Backend from 'react-dnd-html5-backend'
import CustomDragLayer from './CustomDragLayer'
import Container from './Container'
import getUUID from '../utils/getUUID'
import * as ViewportUtils from '../utils/viewport'

class SceneGraph extends Component {
  static propTypes = {
    focused: PropTypes.bool,
    onChange: PropTypes.func.isRequired,
    onDragConnectionStart: PropTypes.func.isRequired,
    renderScene: PropTypes.func.isRequired,
    renderSceneHeader: PropTypes.func.isRequired,
    data: PropTypes.object,
    onConnectionChange: PropTypes.func,
    showConnections: PropTypes.bool,
    style: PropTypes.object,
    onViewportChange: PropTypes.func,
    viewport: PropTypes.object.isRequired,
    zoomFactor: PropTypes.number,
    zoomSensitivity: PropTypes.number,
    scrollSensitivity: PropTypes.number,
  }

  static defaultProps = {
    data: {},
    focused: true,
    zoomFactor: 2,
    zoomSensitivity: 1,
    scrollSensitivity: 1,
    showConnections: true,
    onConnectionChange: () => {},
    onViewportChange: () => {},
  };

  handleDragConnectionEnd = (sourceScene, sourceInitialOffset, targetScene) => {
    const { data, onChange, onConnectionChange, viewport } = this.props;
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

  handleDragSceneEnd = ({id}, delta) => {
    const { data, onChange, onConnectionChange, viewport } = this.props;
    const scene = data.scenes[id]
    const updatedConnections = {}
    const newConnections = _.mapValues(data.connections, (connection) => {
      if (connection.from === id) {
        const updatedConnection = {
          ...connection,
          startX: connection.startX + (delta.x / viewport.scale),
          startY: connection.startY + (delta.y / viewport.scale),
        };
        updatedConnections[connection.id] = updatedConnection;
        return updatedConnection;
      } else {
        return connection;
      }
    });

    if (Object.keys(updatedConnections).length) {
      onConnectionChange('update', updatedConnections);
    }
    
    onChange(update(data, {
      scenes: {
        [scene.id]: {
          x: { $set: scene.x + (delta.x / viewport.scale) },
          y: { $set: scene.y + (delta.y / viewport.scale) },
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
    if (data.connections[id]) {
      onConnectionChange('delete', {
        [id]: data.connections[id],
      })
      onChange(update(this.props.data, {
        connections: {
          $set: _.omit(data.connections, id),
        },
      }));
    }
  }
  
  moveViewport = (delta) => {
    const {viewport} = this.props;
    const newViewport = ViewportUtils.move(viewport, delta);
    
    this.props.onViewportChange(newViewport);
  }
  
  zoomViewport = (factor) => {
    const {viewport} = this.props;
    const newViewport = ViewportUtils.zoom(viewport, factor);
    
    this.props.onViewportChange(newViewport);
  }
  
  handleKeyDown = (e) => {  
    const {focused, zoomFactor} = this.props;
    
    if (
      focused &&
      e.metaKey &&
      (e.code === 'Equal' || e.code === 'Minus')
    ) {
      e.preventDefault();
      e.stopPropagation();
      
      if (e.code === 'Equal') {
        this.zoomViewport(zoomFactor);
      } else {
        this.zoomViewport(1 / zoomFactor);
      }
    }
  }
  
  handleWheel = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    const {deltaX, deltaY} = e;
    const {zoomSensitivity, scrollSensitivity} = this.props;
    
    // Zoom (ctrlKey indicates zoom)
    if (e.ctrlKey) {
      
      // Negative deltaY means zoom out, positive means zoom in.
      // We subtract this delta from 1, since we later multiply by 
      // the current viewport scale.
      this.zoomViewport(1 - (deltaY / 100) * zoomSensitivity);
      
    // Pan
    } else {
      this.moveViewport({
        x: (-deltaX / 3) * scrollSensitivity, 
        y: (-deltaY / 3) * scrollSensitivity,
      });
    }
  }
  
  componentDidMount() {
    window.addEventListener('keydown', this.handleKeyDown);
  }
  
  componentWillUnmount() {
    window.removeEventListener('keydown', this.handleKeyDown);
  }

  render() {
    const {
      data,
      focused,
      onDragConnectionStart,
      renderScene,
      renderSceneHeader,
      showConnections,
      style,
      viewport,
    } = this.props

    return (
      <div 
        style={style}
        onWheel={this.handleWheel}
      >
        <Container
          captureEvents={focused}
          connections={data.connections}
          onDragConnectionEnd={this.handleDragConnectionEnd}
          onDragConnectionStart={onDragConnectionStart}
          onDragSceneEnd={this.handleDragSceneEnd}
          onPanMove={this.moveViewport}
          onTargetlessConnectionDrop={this.handleRemoveConnection}
          renderScene={renderScene}
          renderSceneHeader={renderSceneHeader}
          scenes={data.scenes}
          showConnections={showConnections}
          updateConnectionStart={this.handleUpdateConnectionStart}
          updateConnectionEnd={this.handleUpdateConnectionEnd}
          updateScene={this.handleUpdateScene}
          viewport={viewport}
        />
        <CustomDragLayer
          connections={data.connections}
          renderScene={renderScene}
          renderSceneHeader={renderSceneHeader}
          scenes={data.scenes}
          showConnections={showConnections}
          viewport={viewport}
        />
      </div>
    )
  }
}

// export default DragDropContext(HTML5Backend)(SceneGraph)
export default SceneGraph
