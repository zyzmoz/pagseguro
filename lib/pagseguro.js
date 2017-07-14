(function(){
    var pagseguro;
    var req;
    req = require('request');
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

            if (this.mode == 'deploy') {
                loadScript('https://stc.pagseguro.uol.com.br/pagseguro/api/v2/checkout/pagseguro.directpayment.js', function(){                                                        
                        
                });  
            } else {
                loadScript('https://stc.sandbox.pagseguro.uol.com.br/pagseguro/api/v2/checkout/pagseguro.directpayment.js', function(){                                                          
                   
                });                
            };     
            return this;
        };      
        
       
        function loadScript(url, callback){

            var script = document.createElement("script")
            script.type = "text/javascript";

            if (script.readyState){  //IE
                script.onreadystatechange = function(){
                    if (script.readyState == "loaded" ||
                            script.readyState == "complete"){
                        script.onreadystatechange = null;
                        callback();
                    }
                };
            } else {  //Others
                script.onload = function(){
                    callback();
                };
            }

            script.src = url;
            document.getElementsByTagName("head")[0].appendChild(script);
        }

        pagseguro.prototype.setSession = function(callback){
            var options = {
                method: 'POST',
                headers: {
                   'Content-Type': 'application/xml;charset=ISO-8859-1'
                }
            }

            if (mode == 'deploy'){
                options.uri = envUrl.production + 'sessions?email=' + this.email + '&token='  + this.token;
            } else {
                options.uri = envUrl.sandbox + 'sessions?email=' + email + '&token='  + token;
            }
            return req(options, function(err, res, body){                
                if (err){
                    return callback(err);
                } else {
                    var parser = new DOMParser();
                    var xmlDoc = parser.parseFromString(body, "text/xml");
                    var session = xmlDoc.getElementsByTagName("id")[0].childNodes[0].nodeValue;   
                                                                                 
                    PagSeguroDirectPayment.setSessionId(session);
                                                                                 

                    return callback(null,session);
                }
            });            
            
        };        
        
        pagseguro.prototype.getHash = function(callback){           
             
            console.log(PagSeguroDirectPayment.getSenderHash());                                        
        };

        pagseguro.prototype.getPaymentMethods = function(value, callback){
            obj = {};
            if (value) 
                obj.amount = value;
            obj.success = function(res){
                callback(null, res);
            };
            obj.error = function(res){
                callback(res);
            };
              
            return PagSeguroDirectPayment.getPaymentMethods(obj);
        };


        return pagseguro;
    })();

    module.exports = pagseguro;

}).call(this);