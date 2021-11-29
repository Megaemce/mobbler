export default class Line {
    constructor(pointA, pointB, restLength, strength) {
        this.pointA = pointA;
        this.pointB = pointB;
        this.gravity = false;
        this.strength = strength === undefined ? 1.0 : strength;
        this.restLength = restLength === undefined ? 10 : restLength;
    }
    update() {
        // Compute desired force
        const deltaX = this.pointB.x - this.pointA.x;
        const deltaY = this.pointB.y - this.pointA.y;
        const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
        const tf = ((distance + this.restLength) / (distance * (this.pointA.massInv + this.pointB.massInv))) * this.strength;
        let f;

        // Apply forces
        if (!this.pointA.fixed && this.gravity) {
            f = tf * this.pointA.massInv;
            this.pointA.x += deltaX * f;
            this.pointA.y += deltaY * f + Math.log(this.pointA.mass * this.pointA.y) / Math.log(Math.floor(this.pointA.y));
        }

        if (!this.pointB.fixed && this.gravity) {
            f = -tf * this.pointB.massInv;
            this.pointB.x += deltaX * f;
            this.pointB.y += deltaY * f + Math.log(this.pointB.mass * this.pointB.y) / Math.log(Math.floor(this.pointB.y));
        }
    }
}
