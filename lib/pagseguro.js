(function(){
    var pagseguro;
    var req, xml;
    req = require('request');
    xml = require('jstoxml');
    var envUrl = {
        production: 'https://ws.pagseguro.uol.com.br/v2/',
        sandbox: 'https://ws.sandbox.pagseguro.uol.com.br/v2/'
    };

    pagseguro = (function(){
        function pagseguro(config){
            this.email = config.email;
            this.token = config.token;
            this.mode = config.mode || 'sandbox';
            this.purchase = {
                payment:{
                    mode: this.mode,
                    currency:'BRL',
                    notificationURL:'',
                    receiverEmail: '',
                    sender: {
                        hash:'',
                        ip:'',
                        bornDate: '',
                        phone: {
                            areaCode: '',
                            number: ''
                        },                    
                        email: '',
                        documents:{
                            document:{
                                type: '',
                                value: ''
                            }                    
                        },
                        name: '',
                        items: [

                        ], 
                        shipping:{
                            address: {
                                street: '',
                                number: '',
                                complement: '',
                                district: '',
                                city: '',
                                state: '',
                                country: '',
                                postalCode: ''
                            },
                            type: 1,
                            cost: 0.00,
                            addressRequired:true
                        },
                        extraAmount: 0.00,
                        method:"boleto",
                        creditCard: {
                            token:'1e358d39e26448dc8a28d0f1815f08c5',
                            installment: {
                                quantity: 1,
                                noInterestInstallmentQuantity: 1,
                                value: 0.00
                            },
                            holder: {
                                name: 'Jose Comprador',
                                documents: {
                                    document: {
                                        type:'CPF',
                                        value:11475714734
                                    }
                                },
                                birthDate: '01/01/1900',
                                phone:{
                                    areaCode:99,
                                    number:99999999
                                }
                            },
                            address: {
                                street: 'Av. PagSeguro',
                                number: '',
                                complement: '',
                                district: '',
                                city: '',
                                state: '',
                                country: '',
                                postalCode: ''
                            }
                        },
                        bank:{
                            name:'bancodobrasil'
                        },
                        dynamicPaymentMethodMessage:{
                            creditCard:'Minha loja',
                            boleto: 'Minha loja'
                        },
                        promoCode: ''                    
                        
                    }

                }
            };

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

            if (this.mode == 'deploy'){
                options.uri = envUrl.production + 'sessions?email=' + this.email + '&token='  + this.token;
            } else {
                options.uri = envUrl.sandbox + 'sessions?email=' + this.email + '&token='  + this.token;
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
            this.purchase.payment.sender.hash = PagSeguroDirectPayment.getSenderHash();                                        
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

        pagseguro.prototype.getBrand = function(cardNumber,callback){
            var str = cardNumber.substr(0,6);
            obj = {};
            obj.cardBin = str;
            obj.success = function(res){
                callback(null, res);
            };
            obj.error = function(res){
                callback(res);
            };

            return PagSeguroDirectPayment.getBrand(obj);            
        };

        pagseguro.prototype.createCardToken = function(cardObj, callback){
            var obj = cardObj;
            obj.success = function(res){
                callback(null, res);
            };
            obj.error = function(res){
                callback(res);
            };

            return PagSeguroDirectPayment.createCardToken(obj);

        };

        pagseguro.prototype.getInstallments = function(installmentObj, callback){            
            var obj = installmentObj;
            obj.success = function(res){
                callback(null, res);
            };
            obj.error = function(res){
                callback(res);
            };

            return PagSeguroDirectPayment.getInstallments(obj);

        };

        pagseguro.prototype.addItem = function(itemObj){
            var obj = {}
            obj.item = {                
                id: itemObj.id,                
                description: itemObj.description,
                amount: itemObj.price,
                quantity: itemObj.quantity
            }
            this.purchase.itens.push(obj);

        };

        pagseguro.prototype.setSender = function(obj){
            req('https://api.ipify.org/?format=json'               
                , function(error, res, body) {
                    console.log(body);
                    //var obj = JSON.parse(body);                
                    // this.purchase.payment.sender.ip = JSON.parse(body).ip
            });            
            this.purchase.payment.sender.name = obj.name;
            this.purchase.payment.sender.bornDate = obj.bornDate;
            this.purchase.payment.sender.phone = obj.phone;      
            this.purchase.payment.sender.email = obj.email;
            this.purchase.payment.sender.documents.document = obj.document;
                            
        };

        pagseguro.prototype.checkout = function(callback){
            var body = '<?xml version="1.0"?>' + 
                xml.toXML(this.purchase);
            console.log(body);           
           
        }

        return pagseguro;
    })();

    module.exports = pagseguro;

}).call(this);