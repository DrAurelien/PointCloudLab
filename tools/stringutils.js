var StringUtils = (function () {
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
//# sourceMappingURL=stringutils.js.map