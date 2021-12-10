export default class Parameter {
    constructor(value, valueSetFunction) {
        this._value = value || 0;
        this._eventIndex = 0;
        this._prevGotTime = 0;
        this.events = [];
        this.valueSetFunction = valueSetFunction;
    }
    get value() {
        return parseFloat(this._value);
    }
    set value(value) {
        this._value = value;
        this.valueSetFunction && this.valueSetFunction(value);
    }
}