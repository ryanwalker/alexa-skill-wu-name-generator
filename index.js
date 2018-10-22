/* eslint-disable  func-names */
/* eslint-disable  no-console */
/* eslint-disable  no-restricted-syntax */

const axios = require('axios');
const cheerio = require('cheerio')
const Alexa = require('ask-sdk');

const SKILL_NAME = 'Wu Name Generator';
const FALLBACK_MESSAGE_DURING_GAME = `The ${SKILL_NAME} skill can't help you with that.  Try guessing a number between 0 and 100. `;
const FALLBACK_REPROMPT_DURING_GAME = 'Please guess a number between 0 and 100.';
const FALLBACK_MESSAGE_OUTSIDE_GAME = `The ${SKILL_NAME} skill can't help you with that.  It will come up with a number between 0 and 100 and you try to guess it by saying a number in that range. Would you like to play?`;
const FALLBACK_REPROMPT_OUTSIDE_GAME = 'Say yes to start the game or no to quit.';

const LaunchRequest = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.session.new || handlerInput.requestEnvelope.request.type === 'LaunchRequest';
  },
  async handle(handlerInput) {
    const attributesManager = handlerInput.attributesManager;
    const responseBuilder = handlerInput.responseBuilder;
    const speechOutput = `Welcome to ${SKILL_NAME}. Would you like to find out what your wu name is?`;
    const reprompt = 'Say yes to start or no to quit.';

    const attributes = await attributesManager.getPersistentAttributes() || {};
    if (Object.keys(attributes).length === 0) {
      attributes.anyAttributesIWant = 'woweeee';
    }

    attributesManager.setSessionAttributes(attributes);

    return responseBuilder
      .speak(speechOutput)
      .reprompt(reprompt)
      .getResponse();
  },
};

const FirstNameRequest = {
  canHandle(handlerInput) {
    const request = handlerInput.requestEnvelope.request;

    return request.type === 'IntentRequest' && request.intent.name === 'FirstNameIntent';
  },
  async handle(handlerInput) {
    const request = handlerInput.requestEnvelope.request;

    const firstName = request.intent.slots.firstName.value;

    const responseBuilder = handlerInput.responseBuilder;
    const speechOutput = `Is your first name ${firstName}?`;
    const reprompt = 'First name reprompt.';

    return responseBuilder
      .speak(speechOutput)
      .reprompt(reprompt)
      .getResponse();
  },
}

const LastNameRequest = {
  canHandle(handlerInput) {
    const request = handlerInput.requestEnvelope.request;

    return request.type === 'IntentRequest' && request.intent.name === 'LastNameIntent';
  },
  async handle(handlerInput) {
    const slots = handlerInput.requestEnvelope.request.intent.slots;

    const nameArray = [
      slots.a.value,
      slots.b.value,
      slots.c.value,
      slots.d.value,
      slots.e.value,
      slots.f.value,
    ]

    const responseBuilder = handlerInput.responseBuilder;
    const speechOutput = `Is your last name ${nameArray.join('')}?`;
    const reprompt = 'Last name reprompt.';

    return responseBuilder
      .speak(speechOutput)
      .reprompt(reprompt)
      .getResponse();
  },

}

const ExitHandler = {
  canHandle(handlerInput) {
    const request = handlerInput.requestEnvelope.request;

    return request.type === 'IntentRequest'
      && (request.intent.name === 'AMAZON.CancelIntent'
        || request.intent.name === 'AMAZON.StopIntent');
  },
  handle(handlerInput) {
    return handlerInput.responseBuilder
      .speak('Thanks for playing!')
      .getResponse();
  },
};

const wuNameRetriever = (event) => {
    var firstName = event.firstName;
    var lastName = event.lastName;

    const formData = 'fname=' + firstName + '&sname=' + lastName;

  return axios.post(
    'https://recordstore.com/wuname.pl',
    formData
  )
  .then(function(response) {
    var datums = response.data
    const $ = cheerio.load(datums)
    const wuName = $('span.newname').text();

    return {
      statusCode: 200,
      body: {
        "firstName": firstName,
        "lastName": lastName,
        "wuName": wuName
      }
    }
  })
  .catch(function (error) {
    console.log(error)
    return {
      statusCode: 500,
      body: {
        "error": "Problem retrieving Wu Name from recordstore.com"
      }
    }

  });
};

const ErrorHandler = {
  canHandle() {
    return true;
  },
  handle(handlerInput, error) {
    console.log(`Error handled: ${error.message}`);

    return handlerInput.responseBuilder
      .speak('Sorry, I can\'t understand the command. Please say again.')
      .reprompt('Sorry, I can\'t understand the command. Please say again.')
      .getResponse();
  },
};


// Register request handlers
const skillBuilder = Alexa.SkillBuilders.standard();

exports.handler = skillBuilder
  .addRequestHandlers(
    LaunchRequest,
    FirstNameRequest,
    LastNameRequest,
    ExitHandler,

  )
  .addErrorHandlers(ErrorHandler)
  .lambda();
