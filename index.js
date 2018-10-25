/* eslint-disable  func-names */
/* eslint-disable  no-console */
/* eslint-disable  no-restricted-syntax */

const axios = require('axios');
const cheerio = require('cheerio')
const Alexa = require('ask-sdk');

const SKILL_NAME = 'Wu Name Generator';

const FIRST_NAME_STATE = 'firstNameState';
const LAST_NAME_STATE = 'lastNameState';
const WU_NAME_STATE = 'wuNameState';

const ExitHandler = {
  canHandle(handlerInput) {
    const request = handlerInput.requestEnvelope.request;

    return request.type === 'IntentRequest'
      && (request.intent.name === 'AMAZON.CancelIntent'
        || request.intent.name === 'AMAZON.StopIntent');
  },
  handle(handlerInput) {
    return handlerInput.responseBuilder
      .speak('Thanks for using ${SKILL_NAME}!')
      .getResponse();
  },
};

const LaunchRequest = {
  canHandle(handlerInput) {
    const request = handlerInput.requestEnvelope.request;

    return handlerInput.requestEnvelope.session.new || request.type === 'LaunchRequest' ||
    (request.type === 'IntentRequest' && request.intent.name === 'AMAZON.StartOverIntent') ||
    (request.type === 'IntentRequest' && request.intent.name === 'AMAZON.HelpIntent')
  },
  async handle(handlerInput) {
    const { attributesManager, responseBuilder } = handlerInput;

    const initialState = {
      skillState: FIRST_NAME_STATE,
    };
    attributesManager.setSessionAttributes(initialState);

    const speechOutput = `${SKILL_NAME}. Let's find out what your wu name is. Please spell your first name.`;
    const reprompt = 'Please spell your first name.';

    return responseBuilder
      .speak(speechOutput)
      .reprompt(reprompt)
      .getResponse();
  },
};

const SpellNameRequest = {
  canHandle(handlerInput) {
    const request = handlerInput.requestEnvelope.request;
    return request.type === 'IntentRequest' && request.intent.name === 'SpellNameIntent';
  },
  async handle(handlerInput) {
    const { attributesManager, responseBuilder } = handlerInput;
    const slots = handlerInput.requestEnvelope.request.intent.slots;
    const sessionAttributes = attributesManager.getSessionAttributes();
    const currentSkillState = sessionAttributes.skillState;


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
    const name = nameArray.join('').trim().replace(/\./g,'');

    let speechOutput = '';
    let reprompt = '';
    if (currentSkillState === FIRST_NAME_STATE) {
      sessionAttributes.firstName = name;
      sessionAttributes.skillState = LAST_NAME_STATE;
      speechOutput = `Your first name is ${name}. Please spell your last name.`;
      reprompt = 'Please spell your last name';
    } else if (currentSkillState === LAST_NAME_STATE) {
      const firstName = sessionAttributes.firstName;
      sessionAttributes.lastName = name;
      sessionAttributes.skillState = skillState = WU_NAME_STATE;
      let wuName = await wuNameRetriever(firstName, name);
      wuName = wuName.toLowerCase()
        .replace(/assman/g,'assasin')
        .replace(/nudist/g, 'neurolinguist');
      speechOutput = `${firstName} ${name}, Your wu name is ${wuName}. To generate a new wu name, say start over.`;
      reprompt = speechOutput;
    }

    return responseBuilder
      .speak(speechOutput)
      .reprompt(reprompt)
      .getResponse();
  },

}




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
    SpellNameRequest,
    ExitHandler,

  )
  .addErrorHandlers(ErrorHandler)
  .lambda();
