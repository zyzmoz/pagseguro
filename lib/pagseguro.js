(function(){
    var pagseguro;
    var req = require('request');
    var envUrl = {
        production: 'https://ws.pagseguro.uol.com.br/v2/',
        sandbox: 'https://ws.sandbox.pagseguro.uol.com.br/v2/'
    };

    pagseguro = (function(){
        function pagseguro(config){
            this.email = config.email;
            this.token = config.token;
            this.mode = config.mode || 'sandbox';
            this.purchase = {};
            return this;
        };  

        pagseguro.prototype.session = function(callback){
            var options = {
                method: 'POST',
                headers: {
                   'Content-Type': 'application/xml;charset=ISO-8859-1'
                }
            }

            if (this.mode == 'production'){
                options.uri = envUrl.production;
            } else {
                options.uri = envUrl.sandbox;
            }
            return req(options, function(err, res, body){
                if (err){
                    return callback(err);
                } else {
                    return callback(null, body);
                }
            });

        };        
        
    })();

    module.exports = pagseguro;

}).call(this);