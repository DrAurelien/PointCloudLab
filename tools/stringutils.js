var StringUtils = /** @class */ (function () {
    function StringUtils() {
    }
    StringUtils.LeftPad = function (str, paddingChar, decimals) {
        var result = str;
        while (result.length < decimals) {
            result = paddingChar + result;
        }
        return result;
    };
    return StringUtils;
}());
