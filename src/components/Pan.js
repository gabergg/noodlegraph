import React, { Component, PropTypes } from 'react';

const CURSOR = {
  NORMAL: 'auto',
  PAN_MODE: '-webkit-grab',
  PANNING: '-webkit-grabbing',
}

export default (Wrapped) => class Pan extends Component {

  static propTypes = {
    onPanStart: PropTypes.func,
    onPanMove: PropTypes.func,
    onPanEnd: PropTypes.func,
    panKeyEnabled: PropTypes.bool,
    panKeyPreventsDefault: PropTypes.bool,
  };

  static defaultProps = {
    onPanStart: () => {},
    onPanMove: () => {},
    onPanEnd: () => {},
    panKeyEnabled: true,
    panKeyPreventsDefault: true,
  };

  state = {};

  componentDidMount() {
    window.addEventListener('keydown', this.handleKeyDown)
    window.addEventListener('keyup', this.handleKeyUp)
  }

  componentWillUnmount() {
    window.removeEventListener('keydown', this.handleKeyDown)
    window.removeEventListener('keyup', this.handleKeyUp)
  }

  handleKeyDown = (e) => {
    const {panKeyEnabled, panKeyPreventsDefault} = this.props
    const {panMode, panning, cursor} = this.state

    if (panKeyEnabled && e.code === 'Space') {

      if (panKeyPreventsDefault) {
        e.preventDefault()
      }

      if (!panMode) {
        this.setState({panMode: true})
      }

      if (!panning && cursor !== CURSOR.PAN_MODE) {
        this.setState({cursor: CURSOR.PAN_MODE})
      }
    }
  }

  handleKeyUp = (e) => {
    const {panKeyEnabled, panKeyPreventsDefault} = this.props
    const {panMode, panning} = this.state

    if (panKeyEnabled && e.code === 'Space') {

      if (panKeyPreventsDefault) {
        e.preventDefault()
      }

      if (panMode) {
        this.setState({panMode: false})
      }

      if (!panning) {
        this.setState({cursor: CURSOR.NORMAL})
      }
    }
  }

  handlePanStart = (e) => {
    const {panMode} = this.state

    if (panMode) {
      e.preventDefault()
      e.stopPropagation()

      this.initialX = e.clientX
      this.initialY = e.clientY

      this.panX = e.clientX
      this.panY = e.clientY

      this.props.onPanStart()

      this.setState({panning: true, cursor: CURSOR.PANNING})
    }
  }

  handlePanMove = (e) => {
    const {panning} = this.state

    if (panning) {
      e.preventDefault()
      e.stopPropagation()

      this.props.onPanMove({
        x: e.clientX - this.panX,
        y: e.clientY - this.panY,
      })

      this.panX = e.clientX
      this.panY = e.clientY
    }
  }

  handlePanEnd = (e) => {
    const {panMode, panning} = this.state

    if (panning) {
      e.preventDefault()
      e.stopPropagation()

      this.props.onPanEnd({
        x: e.clientX - this.initialX,
        y: e.clientY - this.initialY,
      })

      if (panning) {
        this.setState({panning: false})
      }

      if (panMode) {
        this.setState({cursor: CURSOR.PAN_MODE})
      } else {
        this.setState({cursor: CURSOR.NORMAL})
      }
    }
  }

  render() {
    const {cursor} = this.state

    return (
      <Wrapped
        {...this.props}
        cursor={cursor}
        handlePanStart={this.handlePanStart}
        handlePanMove={this.handlePanMove}
        handlePanEnd={this.handlePanEnd}
      />
    )
  }
}
