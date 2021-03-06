var Data = Factory.extend({
    ajax: function(opts){
        if (!opts.url) throw new Error('Url is required.');
        if (!opts.type) throw new Error('Request type is required.');

        opts.contentType = opts.contentType || 'application/json';
        opts.encode      = opts.encode || null;
        opts.payload     = opts.payload || null;
        opts.indexBy     = opts.indexBy || 'id';

        return ajax(opts)
                .then(_parse.bind(this))
                .then(_updateStore.bind(this));

        function _updateStore(rsp) {
            if (opts.type.toUpperCase() === 'DELETE') {
                if (Array.isArray(rsp)) {
                    rsp.forEach(function(d) {
                        this.unset(d[opts.indexBy], d);
                    }.bind(this));
                } else if (typeof rsp === 'object') {
                    this.unset(rsp[opts.indexBy], rsp);
                }
            } else {
                if (Array.isArray(rsp)) {
                    rsp.forEach(function(d) {
                        this.set(d[opts.indexBy], d);
                    }.bind(this));
                } else if (typeof rsp === 'object') {
                    this.set(rsp[opts.indexBy], rsp);
                }
            }
            return rsp;
        }

        function _parse(rsp) {
            if (opts.parse) {
                return opts.parse(rsp);
            } 
            return this.parse(rsp);
        }
    },

    parse: function(rsp) {
        return JSON.parse(rsp);
    }
});

var datastore = {};
var Resource = function() {};

Resource.prototype.register = function(name) {
    if (datastore[name]) {
        throw new Error('Resource ' + name + ' already exist.');
    }

    datastore[name] = new Data();
    return datastore[name];
};

Resource.prototype.get = function(name) {
    return datastore[name] ? datastore[name] : this.register(name);
};
