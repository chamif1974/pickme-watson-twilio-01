/*eslint-env node*/

//------------------------------------------------------------------------------
// node.js starter application for Bluemix
//------------------------------------------------------------------------------

// This application uses express as its web server
// for more info, see: http://expressjs.com
var express = require('express');

// cfenv provides access to your Cloud Foundry environment
// for more info, see: https://www.npmjs.com/package/cfenv
var cfenv = require('cfenv');

// create a new express server
var app = express();

// serve the files out of ./public as our main files
//app.use(express.static(__dirname + '/public'));

// get the app environment from Cloud Foundry
var appEnv = cfenv.getAppEnv();

var twilio = require("twilio");
var service = cfenv.getAppEnv().getService("twilio");
var twilio_auth_token = service.credentials.authToken;
//var doctor = require("../lib/doctor.js");
var ConversationV1 = require('watson-developer-cloud/conversation/v1');
var contexts = [];

var conversation = new ConversationV1({
		username:'581d14e8-198b-4762-ba83-06fc2f3cfeb8',
		password:'MJsgvgGvgNro',
		version_date:'2016-10-21'
	});

	
app.get("/sms", twilio.webhook(twilio_auth_token), function (req, res) {
  	var message = req.query.Body;
	var number = req.query.From;
	var twilionumber = req.query.To;
	
	var context = null;
	var index = 0;
	var contextIndex = 0;
	contexts.forEach(function(value){
		console.log(value.from);
		if (value.from === number){
			context = value.context;
			contextIndex = index;
		}
		index = index + 1;
	});
	
	console.log('Received message from '+ number + 'saying\''+ message +'\'');
	console.log(JSON.stringify(context));
	
		conversation.message({
		input:{text:message},
		workspace_id:'0c351ca9-1092-4078-823f-69726c911589',
		context:context
	},function(err,response){
		if(err){
			console.error(err);
		} else {
			console.log(response.output.text[0]);
			if(context===null){
				contexts.push({'from':number,'context':response.context});
			} else {
				contexts[contextIndex].context=response.context;
			}
			
			var intent = response.intents[0].intent;
			console.log(intent);
			if(intent==="done"){
				contexts.splice(contextIndex,1);
			}
			
			var client = require('twilio')(
			'ACcb05d8968a6f4d6a3bfd56811d696c19',
			'6af780368fe871e2dab4955571a5256b'
			);
			
			client.messages.create({
				from:twilionumber,
				to:number,
				body:response.output.text[0]
			},function(err,message){
				if(err){
				console.error(err.message);
			}

			});
			/*console.log("sms.."+req.body.MessageSid);
  			var twiml = new twilio.TwimlResponse();
  			twiml.message(response.output.text[0]);
    		res.send(twiml);*/
		}
	});
	res.send('');


  //console.log(req.body.MessageSid + " QUESTION: " + req.body.Body);
  /*doctor.ask(req.body.Body, function (answer) {
    console.log(req.body.MessageSid + " ANSWER: " + answer);

    twiml.message(answer);
    res.send(twiml);
  });*/

});
// start server on the specified port and binding host
app.listen(appEnv.port, '0.0.0.0', function() {
  // print a message when the server starts listening
  console.log("server starting on " + appEnv.url);
});
