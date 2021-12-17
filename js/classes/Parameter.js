export default class Parameter {
    constructor(initalValue, valueSetFunction) {
        this._value = initalValue || 0;
        this.valueSetFunction = valueSetFunction;
    }
    get value() {
        return parseFloat(this._value);
    }
    set value(newValue) {
        this._value = newValue;
        this.valueSetFunction && this.valueSetFunction(newValue);
    }
}
