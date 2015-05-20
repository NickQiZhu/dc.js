export var Exception = function (msg) {
    var _msg = msg || 'Unexpected internal error';

    this.message = _msg;

    this.toString = function () {
        return _msg;
    };
};

export var InvalidStateException = function () {
    Exception.apply(this, arguments);
};
