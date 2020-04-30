var NameProvider = (function () {
    function NameProvider() {
    }
    NameProvider.GetName = function (key) {
        if (!(key in this.indices)) {
            this.indices[key] = 0;
        }
        var name = key + ' ' + this.indices[key];
        this.indices[key]++;
        return name;
    };
    NameProvider.indices = {};
    return NameProvider;
}());
//# sourceMappingURL=nameprovider.js.map