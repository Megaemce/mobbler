export default class Point {
    constructor(x, y, mass, fixed) {
        this.x = x === undefined ? 0 : x;
        this.y = y === undefined ? 0 : y;
        this.mass = mass === undefined ? 1.0 : mass;
        this.massInv = 1.0 / this.mass;
        this.fixed = fixed === undefined ? false : fixed;
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
