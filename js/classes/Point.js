export default class Point {
    constructor(x, y, mass, fixed) {
        this.x = x || 0;
        this.y = y || 0;
        this.mass = mass || 1.0;
        this.massInv = 1.0 / this.mass;
        this.fixed = fixed || false;
    }
    move(x, y) {
        this.x = this.x + x;
        this.y = this.y + y;
    }
}