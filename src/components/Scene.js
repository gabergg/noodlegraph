import React, { Component, PropTypes } from 'react';
import { DragSource } from 'react-dnd';
import { getEmptyImage } from 'react-dnd-html5-backend';
import ItemTypes from '../constants/ItemTypes';

class Scene extends Component {
  static propTypes = {
    canDrag: PropTypes.bool.isRequired,
    connectConnectionDragPreview: PropTypes.func.isRequired,
    connectConnectionDragSource: PropTypes.func.isRequired,
    onTargetlessConnectionDrop: PropTypes.func.isRequired,
    renderScene: PropTypes.func.isRequired,
    scene: PropTypes.object.isRequired,
    scale: PropTypes.number.isRequired,
  };

  componentDidMount() {
    this.props.connectConnectionDragPreview(getEmptyImage());
  }

  render() {
    const { connectConnectionDragSource, renderScene, scene, scale } = this.props;

    return connectConnectionDragSource(
      <div>
        {renderScene({id: scene.id, scale})}
      </div>
    )
  }
}

const connectionSource = {
  beginDrag(props) {
    return {...props.scene};
  },
  canDrag(props) {
    return props.canDrag;
  },
  endDrag(props, monitor, component) {
    if (!monitor.didDrop()) {
      props.onTargetlessConnectionDrop(monitor.getItem().id);
    }
  },
};

const dragConnectionCollect = (connect, monitor) => ({
  connectConnectionDragPreview: connect.dragPreview(),
  connectConnectionDragSource: connect.dragSource(),
});

export default DragSource(
  ItemTypes.NEW_CONNECTION,
  connectionSource,
  dragConnectionCollect
)(Scene);
