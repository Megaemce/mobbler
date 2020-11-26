export default class Point {
    constructor(x, y, mass) {
        this.x = x || 0;
        this.y = y || 0;
        this.mass = mass || 1.0;
        this.massInv = 1.0 / this.mass;
        this.fixed = false;
    }
}