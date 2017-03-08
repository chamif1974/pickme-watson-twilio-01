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
app.use(express.static(__dirname + '/public'));

// get the app environment from Cloud Foundry
var appEnv = cfenv.getAppEnv();

var twilio = require("twilio");
var service = cfenv.getAppEnv().getService("twilio");
var twilio_auth_token = service.credentials.authToken;
var doctor = require("../lib/doctor.js");

app.post("/sms", twilio.webhook(twilio_auth_token), function (req, res) {

  console.log("sms.."+req.body.MessageSid);
  var twiml = new twilio.TwimlResponse();

  console.log(req.body.MessageSid + " QUESTION: " + req.body.Body);
  doctor.ask(req.body.Body, function (answer) {
    console.log(req.body.MessageSid + " ANSWER: " + answer);

    twiml.message(answer);
    res.send(twiml);
  });

});
// start server on the specified port and binding host
app.listen(appEnv.port, '0.0.0.0', function() {
  // print a message when the server starts listening
  console.log("server starting on " + appEnv.url);
});
