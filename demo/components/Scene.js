import React, { Component } from 'react'

export default class Scene extends Component {

  render () {
    const { width, height, isDragging, scale } = this.props;
    const scaledWidth = scale * width;
    const scaledHeight = scale * height;
    const containerStyle = {
      width: `${scaledWidth}px`,
      height: `${scaledHeight}px`,
      backgroundColor: 'white',
      border: isDragging ? '1px solid red' : '1px solid black',
    };

    const buttonDivStyle = {
      width: scaledWidth / 2,
      height: scaledHeight / 2,
      border: '1px solid red',
      margin: 'auto',
      marginTop: scaledHeight / 5,
    };

    return (
      <div style={containerStyle}>
        <div style={buttonDivStyle}/>
      </div>
    );
  }
}
