export default class Line {
    constructor(p1, p2, restLength, strength) {
        this.p1 = p1;
        this.p2 = p2;
        this.restLength = restLength || 10;
        this.strength = strength || 1.0;
        this.gravity = false;
    }
    update() {
        // Compute desired force
        let dx = this.p2.x - this.p1.x,
            dy = this.p2.y - this.p1.y,
            dd = Math.sqrt(dx * dx + dy * dy) + 0.1,
            tf = (dd - this.restLength) / (dd * (this.p1.massInv + this.p2.massInv)) * this
            .strength,
            f;

        // Apply forces
        if (!this.p1.fixed && this.gravity) {
            f = tf * this.p1.massInv;
            this.p1.x += dx * f;
            this.p1.y += dy * f + Math.log(this.p1.mass * this.p1.y) / Math.log(Math.floor(this.p1.y));
        }

        if (!this.p2.fixed && this.gravity) {
            f = -tf * this.p2.massInv;
            this.p2.x += dx * f;
            this.p2.y += dy * f + Math.log(this.p2.mass * this.p2.y) / Math.log(Math.floor(this.p2.y));
        }
    };
}