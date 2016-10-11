import React, { Component, PropTypes } from 'react';
import ItemTypes from '../constants/ItemTypes';
import { DropTarget } from 'react-dnd';
import _ from 'lodash';
import Scene from './Scene';
import SceneHeader from './SceneHeader';

class DraggableScene extends Component {
  static propTypes = {
    connectionLocation: PropTypes.object,
    onDragConnectionStart: PropTypes.func.isRequired,
    onDragConnectionEnd: PropTypes.func.isRequired,
    updateConnectionStart: PropTypes.func.isRequired,
    updateConnectionEnd: PropTypes.func.isRequired,
    onSceneDragChange: PropTypes.func.isRequired,
    onSceneHeaderRef: PropTypes.func.isRequired,
    onTargetlessConnectionDrop: PropTypes.func.isRequired,
    renderScene: PropTypes.func.isRequired,
    renderSceneHeader: PropTypes.func.isRequired,
    scene: PropTypes.object.isRequired,
    scaledScene: PropTypes.object.isRequired,
    scale: PropTypes.number.isRequired,
  };

  componentWillMount() {
    this.firedHeaderRef = false;
  }

  handleSceneMouseDown = (event) => {
    const { onDragConnectionStart, scene } = this.props;
    const {pageX: x, pageY: y} = event;
    onDragConnectionStart(scene, {x, y});
  }

  render() {
    const {
      connectDropTarget,
      connectionLocation,
      onSceneDragChange,
      onSceneHeaderRef,
      onTargetlessConnectionDrop,
      renderScene,
      renderSceneHeader,
      scene,
      scale,
      scaledScene,
    } = this.props;

    const styles = {
      position: 'absolute',
      left: scaledScene.x,
      top: scaledScene.y,
    };

    return connectDropTarget(
      <div
        ref={(node) => {
          if(node && !this.firedHeaderRef && scaledScene.height > 0) {
            this.firedHeaderRef = true;
            onSceneHeaderRef(node.getBoundingClientRect().height - scaledScene.height);
          }
        }}
        style={styles}>
        <SceneHeader
          key={`${scene.id}header`}
          renderSceneHeader={renderSceneHeader}
          scene={scene}
          scale={scale}
          onSceneDragChange={onSceneDragChange}
        />
        <div onMouseDown={this.handleSceneMouseDown}>
          <Scene
            canDrag={!_.isEmpty(connectionLocation)}
            key={scene.id}
            renderScene={renderScene}
            scene={scene}
            scale={scale}
            onTargetlessConnectionDrop={onTargetlessConnectionDrop}
          />
        </div>
      </div>
    );
  }
}

const connectionTarget = {
  drop(props, monitor) {
    const {
      connectionLocation,
      onDragConnectionStart,
      onDragConnectionEnd,
      onTargetlessConnectionDrop,
      updateConnectionStart,
      updateConnectionEnd,
      scene,
    } = props;
    const item = monitor.getItem();
    const itemType = monitor.getItemType();

    if (itemType === ItemTypes.NEW_CONNECTION) {
      onDragConnectionEnd(item, connectionLocation, scene);
    } else if (itemType === ItemTypes.CONNECTION_START) {
      const clientOffset = monitor.getClientOffset();
      const connectionStartLoc = onDragConnectionStart(scene, clientOffset);
      if (!_.isEmpty(connectionStartLoc)) {
        updateConnectionStart(item.id, connectionStartLoc, scene.id);
      } else {
        onTargetlessConnectionDrop(item.id);
      }
    } else if (itemType === ItemTypes.CONNECTION_END) {
      updateConnectionEnd(item.id, scene.id);
    }
  }
}

const dropConnectionCollect = (connect) => ({
  connectDropTarget: connect.dropTarget(),
});

const accepts = [ItemTypes.NEW_CONNECTION, ItemTypes.CONNECTION_START, ItemTypes.CONNECTION_END];

export default DropTarget(accepts, connectionTarget, dropConnectionCollect)(DraggableScene)
