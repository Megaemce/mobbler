export default class Cable {
    constructor(source, destination, shape) {
        this.source = source;
        this.destination = destination;
        this.shape = shape;
    }
    removeFromCanvas() {
        let canvasShape = document.getElementById(this.shape.id)
        canvasShape && canvasShape.parentNode.removeChild(canvasShape);
    }

    updateStartPoint(x, y) {
        this.shape.setAttributeNS(null, "x1", x);
        this.shape.setAttributeNS(null, "y1", y);
    }
    updateEndPoint(x, y) {
        this.shape.setAttributeNS(null, "x2", x);
        this.shape.setAttributeNS(null, "y2", y);
    }

    deleteCable() {
        this.removeFromCanvas();

        // go to the neighboors and check if there are pointing back to the same direction as cable 
        // if yes, remove it from the incomingCables list
        // checking destination in case of activeCable removal
        if (this.destination && this.destination.incomingCables) {

            this.destination.incomingCables.slice(0).forEach((cable, index) => {
                if (cable.source === this.source) {
                    this.destination.incomingCables.splice(index, 1);
                }
            });
        }

        // remove it from the outcomingCables list
        if (this.source.outcomingCables) {
            this.source.outcomingCables.slice(0).forEach((cable, index) => {
                if (cable.destination === this.destination) {
                    this.source.outcomingCables.splice(index, 1);
                }
            });
        }

        // reconnect all the others nodes
        if (this.source.audioNode) {
            this.source.audioNode.disconnect();

            if (this.source.outcomingCables) {
                this.source.outcomingCables.forEach(cable => {
                    this.source.audioNode.connect(cable.destination.audioNode);
                });
            }
        }
    }
    drawOnCanvas() {
        // set id based on destination: if null it means that this is still an active cable
        this.shape.id = this.destination ? `${this.source.id}-cable-to-${this.destination.id}` : `${this.source.id}-cable-active`;
        document.getElementById("svgCanvas").appendChild(this.shape);

        //if real cable set onclick function as well
        if (this.destination) {
            this.shape.onclick = () => {
                this.deleteCable()
            }
        }
    }
}