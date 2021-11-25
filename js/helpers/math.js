const digitsAfterDot = 2;

// from log slider position to real value
export function logPositionToValue(position, min, max) {
    // calculate adjustment factor
    let scale = (Math.log(max) - Math.log(min || 1)) / (max - min);
    let calculation = Math.exp((position - min) * scale + Math.log(min || 1));
    return parseFloat(calculation.toFixed(digitsAfterDot));
}

// from real value to log slider position
export function valueToLogPosition(value, min, max) {
    // calculate adjustment factor
    let scale = (Math.log(max) - Math.log(min || 1)) / (max - min);
    let calculation = min + (Math.log(value || 1) - Math.log(min || 1)) / scale;
    return parseFloat(calculation.toFixed(digitsAfterDot));
}

export function scaleBetween(givenNum, givenMin, givenMax, desirableMin, desirableMax) {
    let calculation = ((desirableMax - desirableMin) * (givenNum - givenMin)) / (givenMax - givenMin) + desirableMin;
    return calculation;
}

export function directionString(pointA, pointB) {
    let angle = (Math.atan2(pointB.y - pointA.y, pointB.x - pointA.x) * 180) / Math.PI;
    if (angle < 0) angle = 360 + angle; // changing range [-180,180] to [0, 360]

    if (angle > 330 || angle <= 30) {
        return "left-to-right";
    } else if (angle > 30 && angle <= 150) {
        return "top-to-bottom";
    } else if (angle > 150 && angle <= 240) {
        return "right-to-left";
    } else if (angle > 240 && angle <= 330) {
        return "bottom-to-top";
    }

    return false;
}
