import React, { Component, PropTypes } from 'react';
import { DragSource } from 'react-dnd';
import { getEmptyImage } from 'react-dnd-html5-backend';
import ItemTypes from '../constants/ItemTypes';
import shallowEqual from '../utils/shallowEqual';

class SceneHeader extends Component {
  static propTypes = {
    connectSceneDragPreview: PropTypes.func.isRequired,
    connectSceneDragSource: PropTypes.func.isRequired,
    isSceneDragging: PropTypes.bool.isRequired,
    onSceneDragChange: PropTypes.func.isRequired,
    renderSceneHeader: PropTypes.func.isRequired,
    scale: PropTypes.number.isRequired,
    scene: PropTypes.object.isRequired,
  };

  componentDidMount() {
    this.props.connectSceneDragPreview(getEmptyImage());
  }

  shouldComponentUpdate(nextProps) {
    return !shallowEqual(nextProps, this.props);
  }

  componentWillReceiveProps(nextProps) {
    const { isSceneDragging, onSceneDragChange, scene } = this.props;

    if (isSceneDragging !== nextProps.isSceneDragging) {
      onSceneDragChange(scene.id, nextProps.isSceneDragging);
    }
  }

  render() {
    const { connectSceneDragSource, renderSceneHeader, scene, scale } = this.props;
    return connectSceneDragSource(
      <div>
        {renderSceneHeader({id: scene.id, scale})}
      </div>
    )
  }
}

const sceneSource = {
  beginDrag(props) {
    return {...props.scene};
  },
  endDrag(props, monitor) {
    const { onSceneDragChange, scene } = props;
    const delta = monitor.getDifferenceFromInitialOffset();
    onSceneDragChange(scene.id, false, delta);
  },
};

const dragSceneCollect = (connect, monitor) => ({
  connectSceneDragPreview: connect.dragPreview(),
  connectSceneDragSource: connect.dragSource(),
  isSceneDragging: monitor.isDragging(),
  initialSceneClientOffset: monitor.getInitialClientOffset(),
  sceneClientOffset: monitor.getClientOffset(),
});

export default DragSource(
  ItemTypes.SCENE,
  sceneSource,
  dragSceneCollect
)(SceneHeader);
