/* from log slider position to real value */
export function logPositionToValue(position, valueMin, valueMax) {
    const min = Math.abs(parseFloat(valueMin)) || 1;
    const max = Math.abs(parseFloat(valueMax)) || 1;
    const minSign = valueMin < 0 ? -1 : 1;
    const maxSign = valueMax < 0 ? -1 : 1;
    if (maxSign * max - minSign * min === 0) return 0;
    // calculate adjustment factor
    const scale = (maxSign * Math.log(max) - minSign * Math.log(min)) / (maxSign * max - minSign * min);
    const calculation = Math.exp((position - minSign * min) * scale + minSign * Math.log(min));

    return calculation;
}

/* from real value to log slider position */
export function valueToLogPosition(sliderValue, sliderMin, sliderMax) {
    // calculate adjustment factor
    const max = parseFloat(sliderMax);
    const min = Math.abs(parseFloat(sliderMin)) || 1;
    const value = Math.abs(parseFloat(sliderValue)) || 1;
    const maxSign = sliderMax < 0 ? -1 : 1;
    const minSign = sliderMin < 0 ? -1 : 1;
    const valueSign = sliderValue < 0 ? -1 : 1;

    const scale = (maxSign * Math.log(max) - minSign * Math.log(min)) / (maxSign * max - minSign * min);
    const calculation = minSign * min + (valueSign * Math.log(value) - minSign * Math.log(min)) / scale;

    return calculation;
}
/* returns direction as a string based on line between point A and B */
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

/* scale value between [from_min:from_max] to [to_min:to_max] range */
export function scaleBetween(value, from_min, from_max, to_min, to_max) {
    const calculation = ((value - from_min) * (to_max - to_min)) / (from_max - from_min) + to_min;

    return calculation;
}
