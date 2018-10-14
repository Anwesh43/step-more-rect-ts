const w : number = window.innerWidth, h : number = window.innerHeight
const nodes : number = 5
class StepMoreRectStage {
    canvas : HTMLCanvasElement = document.createElement('canvas')
    context : CanvasRenderingContext2D
    smr : StepMoreRect = new StepMoreRect()
    animator : Animator = new Animator()

    initCanvas() {
        this.canvas.width = w
        this.canvas.height = h
        this.context = this.canvas.getContext('2d')
        document.body.appendChild(this.canvas)
    }

    render() {
        this.context.fillStyle = '#BDBDBD'
        this.context.fillRect(0, 0, w, h)
        this.smr.draw(this.context)
    }

    handleTap() {
        this.canvas.onmousedown = () => {
            this.smr.startUpdating(() => {
                this.animator.start(() => {
                    this.render()
                    this.smr.update(() => {
                        this.animator.stop()
                    })
                })
            })
        }
    }

    static init() {
        const stage : StepMoreRectStage = new StepMoreRectStage()
        stage.render()
        stage.handleTap()
    }
}

class State {
    scale : number = 0
    dir : number = 0
    prevScale : number = 0

    update(cb : Function) {
        this.scale += 0.05 * this.dir
        if (Math.abs(this.scale - this.prevScale) > 1) {
            this.scale = this.prevScale + this.dir
            this.dir = 0
            this.prevScale = this.scale
            cb()
        }
    }

    startUpdating(cb : Function) {
        if (this.dir == 0) {
            this.dir = 1 - 2 * this.prevScale
            cb()
        }
    }
}

class Animator {
    animated : boolean = false
    interval : number

    start(cb : Function) {
        if (!this.animated) {
            this.animated = true
            this.interval = setInterval(cb, 50)
        }
    }

    stop() {
        if (this.animated) {
            this.animated = false
            clearInterval(this.interval)
        }
    }
}

class SMRNode {
    state : State = new State()
    next : SMRNode
    prev : SMRNode

    constructor(private i : number) {
        this.addNeighbor()
    }

    addNeighbor() {
        if (this.i < nodes - 1) {
            this.next = new SMRNode(this.i + 1)
            this.next.prev = this
        }
    }

    draw(context : CanvasRenderingContext2D) {
        const gap : number = w / (nodes + 1)
        const size_factors = [3, 4]
        const colors = ["#4527A0", "white"]
        context.save()
        context.translate(gap * this.i + gap, h/2)
        for (var j = 0; j < 2; j++) {
            const sc : number = Math.min(0.5, Math.max(0, this.state.scale - 0.5 * j)) * 2
            context.fillStyle = colors[j]
            context.save()
            context.scale(sc, sc)
            const size = gap / size_factors[j]
            context.fillRect(-size, -size, 2 * size, 2 * size)
            context.restore()
        }
        context.restore()
    }

    update(cb : Function) {
        this.state.update(cb)
    }

    startUpdating(cb : Function) {
        this.state.startUpdating(cb)
    }

    getNext(dir : number, cb : Function) : SMRNode {
        var curr : SMRNode = this.prev
        if (dir == 1) {
            curr = this.next
        }
        if (curr) {
            return curr
        }
        cb()
        return this
    }
}

class StepMoreRect {

    root : SMRNode = new SMRNode(0)

    curr : SMRNode = this.root

    dir : number = 1

    draw(context : CanvasRenderingContext2D) {
        this.curr.draw(context)
    }

    update(cb : Function) {
        this.curr.update(() => {
            this.curr = this.curr.getNext(this.dir, () => {
                this.dir *= -1
            })
            cb()
        })
    }

    startUpdating(cb : Function) {
        this.curr.startUpdating(cb)
    }
}
