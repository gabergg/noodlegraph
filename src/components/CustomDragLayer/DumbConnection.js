import React, { Component, PropTypes } from 'react';
import SVGComponent from '../SVGComponent';
import CurvedLine from '../CurvedLine';
import shallowEqual from '../../utils/shallowEqual';

const layerStyles = {
  position: 'absolute',
  pointerEvents: 'none',
  zIndex: 100,
  left: 0,
  top: 0,
  width: '100%',
  height: '100%',
};

const STROKE_COLOR = "#4A90E2";
const STROKE_WIDTH = 2;

function getCircleStyle (x, y, end) {
  const circleSize = end ? 10 : 4;
  const circleOffset = end ? 6 : 4;
  return {
    height: `${circleSize}px`,
    width: `${circleSize}px`,
    borderRadius: '50%',
    border: `${STROKE_WIDTH}px solid ${STROKE_COLOR}`,
    position: 'absolute',
    left: x,
    top: y,
    backgroundColor: STROKE_COLOR,
    zIndex: 2,
  };
}

export default class DumbConnection extends Component {

    static propTypes = {
        startX: PropTypes.number.isRequired,
        startY: PropTypes.number.isRequired,
        endX: PropTypes.number.isRequired,
        endY: PropTypes.number.isRequired,
    };

    shouldComponentUpdate(nextProps) {
      return !shallowEqual(nextProps, this.props);
    }

    render() {
        const { startX, startY, endX, endY } = this.props;
        const svgContainerStyle = {
          position: 'absolute',
          pointerEvents: 'none',
        };

        return (
          <div style={layerStyles}>
            <div style={getCircleStyle(startX, startY, false)}/>
            <SVGComponent
              height={'100%'}
              width={'100%'}
              style={svgContainerStyle}
            >
              <CurvedLine
                startX={startX}
                startY={startY}
                endX={endX}
                endY={endY}
                strokeWidth={STROKE_WIDTH}
                strokeColor={STROKE_COLOR}
              />
            </SVGComponent>
            <div style={getCircleStyle(endX, endY, true)}/>
          </div>
        );
    }
}
