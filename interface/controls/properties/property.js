var Property = /** @class */ (function () {
    function Property(name, changeHandler) {
        this.name = name;
        this.changeHandler = changeHandler;
    }
    Property.prototype.NotifyChange = function () {
        var value = this.GetValue();
        if (value !== null) {
            if (this.changeHandler) {
                this.changeHandler(value);
            }
            if (this.owner) {
                this.owner.NotifyChange(this);
            }
        }
    };
    return Property;
}());
