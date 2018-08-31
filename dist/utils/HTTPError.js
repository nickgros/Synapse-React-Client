function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var HTTPError = function (_Error) {
    _inherits(HTTPError, _Error);

    function HTTPError(message) {
        var _ref;

        _classCallCheck(this, HTTPError);

        for (var _len = arguments.length, params = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
            params[_key - 1] = arguments[_key];
        }

        var _this = _possibleConstructorReturn(this, (_ref = HTTPError.__proto__ || Object.getPrototypeOf(HTTPError)).call.apply(_ref, [this].concat(params)));

        _this.message = message;
        _this.name = 'HTTP';
        return _this;
    }

    return HTTPError;
}(Error);

export default HTTPError;