var Properties = /** @class */ (function () {
    function Properties(properties) {
        if (properties === void 0) { properties = []; }
        this.properties = properties;
    }
    Properties.prototype.Push = function (property) {
        this.properties.push(property);
        property.owner = this;
    };
    Properties.prototype.GetSize = function () {
        return this.properties.length;
    };
    Properties.prototype.GetProperty = function (index) {
        return this.properties[index];
    };
    Properties.prototype.GetPropertyByName = function (propertyName) {
        for (var index = 0; index < this.properties.length; index++) {
            var property = this.properties[index];
            if (property.name == propertyName) {
                return property;
            }
        }
        return null;
    };
    Properties.prototype.GetValue = function (propertyName) {
        var property = this.GetPropertyByName(propertyName);
        if (property) {
            return property.GetValue();
        }
        return null;
    };
    Properties.prototype.NotifyChange = function (property) {
        if (this.onChange) {
            this.onChange();
        }
    };
    Properties.prototype.GetElement = function () {
        var table = document.createElement('table');
        table.className = 'Properties';
        for (var index = 0; index < this.properties.length; index++) {
            var property = this.properties[index];
            var row = document.createElement('tr');
            row.className = 'Property';
            table.appendChild(row);
            var leftCol = document.createElement('td');
            leftCol.className = 'PropertyName';
            var leftColContent = document.createTextNode(property.name);
            leftCol.appendChild(leftColContent);
            row.appendChild(leftCol);
            if (property instanceof PropertyGroup) {
                leftCol.colSpan = 2;
                var row_1 = document.createElement('tr');
                row_1.className = 'Property';
                table.appendChild(row_1);
                var col = document.createElement('td');
                col.colSpan = 2;
                col.className = 'PropertyCompound';
                col.appendChild(property.GetElement());
                row_1.appendChild(col);
            }
            else {
                var rightCol = document.createElement('td');
                rightCol.className = 'PropertyValue';
                rightCol.appendChild(property.GetElement());
                row.appendChild(rightCol);
            }
        }
        return table;
    };
    return Properties;
}());
//# sourceMappingURL=properties.js.map