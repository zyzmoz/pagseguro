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
            this.purchase.hash = PagSeguroDirectPayment.getSenderHash();                                        
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

        pagseguro.prototype.checkout = function(callback){
            /**<?xml version="1.0"?>
<payment>
  <mode>default</mode>
  <currency>BRL</currency>
  <notificationURL>https://sualoja.com.br/notifica.html</notificationURL>
  <receiverEmail>suporte@lojamodelo.com.br</receiverEmail>
  <sender>
    <hash>d680a0c1a20d7f255556fc8a52336a4b5f093a83adfd66772ff2b4f19bc384fb</hash>
    <ip>1.1.1.1</ip>
    <bornDate>01/01/1900</bornDate>
    <phone>
      <areaCode>99</areaCode>
      <number>99999999</number>
    </phone>
    <email>comprador@uol.com.br</email>
    <documents>
      <document>
        <type>CPF</type>
        <value>11475714734</value>
      </document>
    </documents>
    <name>Jose Comprador</name>
  </sender>
  <items>
    <item>
      <id>0001</id>
      <description>Produto PagSeguroI</description>
      <amount>99999.99</amount>
      <quantity>1</quantity>
    </item>
  </items>
  <reference>REF1234</reference>
  <shipping>
    <address>
      <street>Av. PagSeguro</street>
      <number>9999</number>
      <complement>99o andar</complement>
      <district>Jardim Internet</district>
      <city>Cidade Exemplo</city>
      <state>SP</state>
      <country>BRA</country>
      <postalCode>99999999</postalCode>
    </address>
    <type>1</type>
    <cost>1.00</cost>
    <addressRequired>true</addressRequired>
  </shipping>
  <extraAmount>1.00</extraAmount>
  <method>boleto</method>
  <creditCard>
    <token>1e358d39e26448dc8a28d0f1815f08c5</token>
    <installment>
      <quantity>1</quantity>
      <noInterestInstallmentQuantity>2</noInterestInstallmentQuantity>
      <value>99999.99</value>
    </installment>
    <holder>
      <name>Jose Comprador</name>
      <documents>
        <document>
          <type>CPF</type>
          <value>11475714734</value>
        </document>
      </documents>
      <birthDate>01/01/1900</birthDate>
      <phone>
        <areaCode>99</areaCode>
        <number>99999999</number>
      </phone>
    </holder>
    <address>
      <street>Av. PagSeguro</street>
      <number>9999</number>
      <complement>99o andar</complement>
      <district>Jardim Internet</district>
      <city>Cidade Exemplo</city>
      <state>SP</state>
      <country>BRA</country>
      <postalCode>99999999</postalCode>
    </address>
  </creditCard>
  <bank>
    <name>bancodobrasil</name>
  </bank>
  <dynamicPaymentMethodMessage>
    <creditCard>Minha loja</creditCard>
    <boleto>Minha loja</boleto>
  </dynamicPaymentMethodMessage>
  <promoCode>PROMOCODE_PAGSEGURO</promoCode>
</payment>
 */
        }

        return pagseguro;
    })();

    module.exports = pagseguro;

}).call(this);