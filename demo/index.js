import React, { Component, PropTypes } from 'react';
import update from 'react/lib/update';
import _ from 'lodash';
import SceneGraph from '../src';
import Scene from './components/Scene';
import SceneHeader from './components/SceneHeader';

export default class Demo extends Component {
  state = {
    scenes: {
      '1': {id: '1', name: 'Scene1', y: 50, x: 50, width: 100, height: 200},
      '2': {id: '2', name: 'Scene2', y: 50, x: 450, width: 100, height: 200},
      '3': {id: '3', name: 'Scene3', y: 50, x: 850, width: 100, height: 200},
    },
    connections: {},
    viewport: {
      x: 500,
      y: 500,
      width: 1500,
      height: 1500,
    },
  };

  handleChange = (data) => {
    this.setState({...data});
  }

  handleDragConnectionStart = (sourceScene, relativeClickLoc) => {
    return {
      x: relativeClickLoc.x,
      y: relativeClickLoc.y,
    }
  }

  renderScene = (scene) => {
    return (
      <div key={scene.id}>
        <Scene {...scene}/>
      </div>
    );
  }

  renderSceneHeader = (scene) => {
    return (
      <div key={`${scene.id}header`}>
        <SceneHeader scene={scene}/>
      </div>
    );
  }

  render() {
    return (
      <SceneGraph
        data={this.state}
        onChange={this.handleChange}
        onDragConnectionStart={this.handleDragConnectionStart}
        renderScene={this.renderScene}
        renderSceneHeader={this.renderSceneHeader}
        showConnections={true}
      />
    )
  }

}
