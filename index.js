const axios = require('axios');
const cheerio = require('cheerio')

const firstName = process.argv[2];
const lastName = process.argv[3];

retrieveWuName(firstName, lastName);

function retrieveWuName(firstName, lastName, callback) {

  const formData = 'fname=' + firstName + '&sname=' + lastName;

  axios.post(
    'https://recordstore.com/wuname.pl',
    formData
  )
  .then(function(response) {
    var datums = response.data
    const $ = cheerio.load(datums)
    const wuName = $('span.newname').text();
    console.log(firstName + ' ' + lastName + ', your Wu Name is \'' + wuName + '\'');
  })
  .catch(function (error) {
    console.log(error)
    console.log('Sorry, I\'m having trouble retrieing your wu name.');
  });
}


exports.handler = async (event) => {
    var firstName = event.firstName;
    var lastName = event.lastName;

    retrieveWuName(firstName, lastName,
      function(message) {
        const response = {
          statusCode: 200,
          body: '{ "message": "' + message + '" }'
        };
        return response;
      }
    );
};
