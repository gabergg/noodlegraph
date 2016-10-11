import React, { Component, PropTypes } from 'react';

export default class SceneHeader extends Component {
    static propTypes = {
        scene: PropTypes.object.isRequired,
    };

    render() {
        const { scene, scale } = this.props;
        const scaledWidth = scale * scene.width;
        const scaledHeight = scale * scene.height;

        const headerStyle = {
          height: scaledHeight / 10,
          width: scaledWidth,
          textAlign: 'center',
          border: '1px solid black',
          borderBottom: '',
        };

        return (
          <div style={headerStyle}>
            {scene.name}
          </div>
        );
    }
}
