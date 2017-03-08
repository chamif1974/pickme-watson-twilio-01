var watson = require("watson-developer-cloud"),
  cfenv = require("cfenv");

/*
var service = cfenv.getAppEnv().getService('question_and_answer')

var question_and_answer_healthcare = watson.question_and_answer({
  username: service.credentials.username,
  password: service.credentials.password,
  version: 'v1',
  dataset: 'healthcare'
})
*/
var ConversationV1 = require('watson-developer-cloud/conversation/v1');

var conversation = new ConversationV1({
  username: "c0fe1b2e-6ebe-4d3d-bf17-27278de4a466",
  password: "IknsREebGIrY",
  version_date: "2016-10-21"
});

/*
exports.ask = function (question, cb) {
  question_and_answer_healthcare.ask({ text: question}, function (err, response) {
    if (err || !response[0].question.evidencelist) {
      log.error(err)
      cb("Unfortunately, I'm unable to answer your question.")
      return
    }

    cb(response[0].question.evidencelist[0].text)
  })
}
*/
var updateMessage = (input, response) => {
  var responseText = null;
  if (!response.output) {
    response.output = {};
  } else {
    return response;
  }
  if (response.intents && response.intents[0]) {
    var intent = response.intents[0];
    // Depending on the confidence of the response the app can return different messages.
    // The confidence will vary depending on how well the system is trained. The service will always try to assign
    // a class/intent to the input. If the confidence is low, then it suggests the service is unsure of the
    // user's intent . In these cases it is usually best to return a disambiguation message
    // ('I did not understand your intent, please rephrase your question', etc..)
    if (intent.confidence >= 0.75) {
      responseText = "I understood your intent was " + intent.intent;
    } else if (intent.confidence >= 0.5) {
      responseText = "I think your intent was " + intent.intent;
    } else {
      responseText = "I did not understand your intent";
    }
  }
  response.output.text = responseText;
  return response;
};

exports.ask = function (question, cb) {
  var workspace = "a67266d4-fcae-4622-a554-5c5668a0b98b";
  var payload = {
      workspace_id: workspace,
      context: question.body.context || {},
      input: question.body.input || {}
    };

    // Send the input to the conversation service
    conversation.message(payload, (error, data) => {
      if (error) {
        return error;
      }
      return cb.json(updateMessage(payload, data));
    });
};

