export default class Point {
    constructor(x, y, mass, fixed) {
        this.x = parseFloat(x || 0);
        this.y = parseFloat(y || 0);
        this.mass = parseFloat(mass || 1.0);
        this.massInv = 1.0 / this.mass;
        this.fixed = fixed || false;
    }
    moveTo(x, y) {
        this.x = x;
        this.y = y;
    }
    moveBy(x, y) {
        this.x += x;
        this.y += y;
        return { x: x, y: y };
    }
}
