export default {
  origin: null,

  keyCode: null,

  dragging: false,

  handleWindowMouseUp: null,

  getDefaultCfg() {
    return {
      allowKeyCode: [32],
      notAllowKeyCode: [16]
    }
  },

  getEvents() {
    return {
      'canvas:mousedown': 'handleCanvasMouseDown',
      'canvas:mousemove': 'handleCanvasMouseMove',
      'canvas:mouseup': 'handleCanvasMouseUp',
      'canvas:mouseleave': 'handleCanvasMouseLeave',
      'canvas:contextmenu': 'handleCanvasContextMenu',
      'keydown': 'handleKeyDown',
      'keyup': 'handleKeyUp'
    }
  },

  canDrag() {
    const { keyCode, allowKeyCode, notAllowKeyCode } = this

    let isAllow = !allowKeyCode.length

    if (!keyCode) {
      return isAllow
    }

    if (allowKeyCode.length && allowKeyCode.includes(keyCode)) {
      isAllow = true
    }

    if (notAllowKeyCode.includes(keyCode)) {
      isAllow = false
    }

    return isAllow
  },

  updateViewport(e) {
    const { clientX, clientY } = e

    const dx = clientX - this.origin.x
    const dy = clientY - this.origin.y

    this.origin = {
      x: clientX,
      y: clientY
    }

    this.graph.translate(dx, dy)
    this.graph.paint()
  },

  handleCanvasMouseDown(e) {
    if (!this.shouldBegin.call(this, e)) {
      return
    }

    if (!this.canDrag()) {
      return
    }

    this.origin = {
      x: e.clientX,
      y: e.clientY
    }

    this.dragging = false
  },

  handleCanvasMouseMove(e) {
    if (!this.shouldUpdate.call(this, e)) {
      return
    }

    if (!this.canDrag()) {
      return
    }

    if (!this.origin) {
      return
    }

    if (!this.dragging) {
      this.graph.emit('canvas:dragstart', {
        type: 'dragstart',
        ...e
      })

      this.dragging = true
    } else {
      this.graph.emit('canvas:drag', {
        type: 'drag',
        ...e
      })

      this.updateViewport(e)
    }
  },

  handleCanvasMouseUp(e) {
    if (!this.shouldEnd.call(this, e)) {
      return
    }

    if (!this.canDrag()) {
      return
    }

    this.graph.emit('canvas:dragend', {
      type: 'dragend',
      ...e
    })

    this.origin = null
    this.dragging = false

    if (this.handleWindowMouseUp) {
      document.body.removeEventListener('mouseup', this.handleWindowMouseUp, false)
      this.handleWindowMouseUp = null
    }
  },

  handleCanvasMouseLeave() {
    const canvasElement = this.graph.get('canvas').get('el')

    if (this.handleWindowMouseUp) {
      return
    }

    this.handleWindowMouseUp = e => {
      if (e.target !== canvasElement) {
        this.handleCanvasMouseUp(e)
      }
    }

    document.body.addEventListener('mouseup', this.handleWindowMouseUp, false)
  },

  handleCanvasContextMenu() {
    this.origin = null
    this.dragging = false
  },

  handleKeyDown(e) {
    this.keyCode = e.keyCode || e.which
  },

  handleKeyUp() {
    this.keyCode = null
  }
}
