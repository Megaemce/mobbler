// from log slider position to real value
export function logPositionToValue(position, min, max, digitsAfterDot) {
    // calculate adjustment factor
    let scale = (Math.log(max) - Math.log(min || 1)) / (max - min);
    return (Math.exp((position - min) * scale + Math.log(min || 1))).toFixed(digitsAfterDot);
}

// from real value to log slider position
export function valueToLogPosition(value, min, max, digitsAfterDot) {
    // calculate adjustment factor
    let scale = (Math.log(max) - Math.log(min || 1)) / (max - min);
    return (min + (Math.log(value || 1) - Math.log(min || 1)) / scale).toFixed(digitsAfterDot);
}

export function scaleBetween(givenNum, givenMin, givenMax, desirableMin, desirableMax, digitsAfterDot) {
    let calculation = (desirableMax - desirableMin) * (givenNum - givenMin) / (givenMax - givenMin) + desirableMin;
    return parseFloat(calculation).toFixed(digitsAfterDot);
}