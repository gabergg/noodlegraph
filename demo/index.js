import React, { Component, PropTypes } from 'react';
import update from 'react/lib/update';
import _ from 'lodash';
import SceneGraph from '../src';
import Scene from './components/Scene';
import SceneHeader from './components/SceneHeader';
import { DragDropContext } from 'react-dnd';
import HTML5Backend from 'react-dnd-html5-backend';

const SceneGraphDraggableContext = DragDropContext(HTML5Backend)(SceneGraph);

export default class Demo extends Component {
  state = {
    scenes: {
      '1': {id: '1', name: 'Scene1', y: 50, x: 50, width: 100, height: 200},
      '2': {id: '2', name: 'Scene2', y: 50, x: 450, width: 100, height: 200},
      '3': {id: '3', name: 'Scene3', y: 50, x: 850, width: 100, height: 200},
    },
    connections: {},
    viewport: {
      x: 300,
      y: 0,
      width: 600,
      height: 600,
      scale: 1,
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
    const style = {
      width: '100%', 
      height: '100%',
    }

    return (
      <SceneGraphDraggableContext
        style={style}
        data={this.state}
        viewport={this.state.viewport}
        onChange={this.handleChange}
        onDragConnectionStart={this.handleDragConnectionStart}
        renderScene={this.renderScene}
        renderSceneHeader={this.renderSceneHeader}
        showConnections={true}
      />
    )
  }

}
