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
    const { attributesManager, responseBuilder } = handlerInput;

    attributesManager.setSessionAttributes({});

    const speechOutput = `Welcome to ${SKILL_NAME}. Would you like to find out what your wu name is?`;
    const reprompt = 'Say yes to start or no to quit.';

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
    const { attributesManager, requestEnvelope, responseBuilder } = handlerInput;
    const sessionAttributes = attributesManager.getSessionAttributes();
    const firstName = requestEnvelope.request.intent.slots.firstName.value;

    sessionAttributes.firstName = firstName;

    const speechOutput = `Your first name is ${firstName}.`;
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
    const { attributesManager, responseBuilder } = handlerInput;
    const slots = handlerInput.requestEnvelope.request.intent.slots;
    const sessionAttributes = attributesManager.getSessionAttributes();
    const firstName = sessionAttributes.firstName;

    const nameArray = [
      slots.a ? slots.a.value : '',
      slots.b ? slots.b.value : '',
      slots.c ? slots.c.value : '',
      slots.d ? slots.d.value : '',
      slots.e ? slots.e.value : '',
      slots.f ? slots.f.value : '',
      slots.g ? slots.g.value : '',
      slots.h ? slots.h.value : '',
      slots.i ? slots.i.value : '',
      slots.j ? slots.j.value : '',
      slots.k ? slots.k.value : '',
      slots.l ? slots.l.value : '',
      slots.m ? slots.m.value : '',
      slots.n ? slots.n.value : '',
      slots.o ? slots.o.value : '',
      slots.p ? slots.p.value : '',
      slots.q ? slots.q.value : '',
      slots.r ? slots.r.value : '',
      slots.s ? slots.s.value : '',
      slots.t ? slots.t.value : '',
      slots.u ? slots.u.value : '',
      slots.v ? slots.v.value : '',
      slots.w ? slots.w.value : '',
      slots.x ? slots.x.value : '',
      slots.y ? slots.y.value : '',
      slots.z ? slots.z.value : '',
    ]
    const lastName = nameArray.join('').trim();
    const wuName = await wuNameRetriever(firstName, lastName);

    const speechOutput = `${firstName} ${lastName}, your wu name is  ${wuName}.`;
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

const wuNameRetriever = (firstName, lastName) => {
  const formData = 'fname=' + firstName + '&sname=' + lastName;

  return axios.post(
    'https://recordstore.com/wuname.pl',
    formData
  )
  .then(function(response) {
    var datums = response.data
    const $ = cheerio.load(datums)
    const wuName = $('span.newname').text();

    return wuName;
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
