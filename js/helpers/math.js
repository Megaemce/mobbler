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
    let calculation = (desirableMax - desirableMin) * (givenNum - givenMin) / (givenMax - givenMin) + desirableMin;
    return parseFloat(calculation.toFixed(digitsAfterDot));
}