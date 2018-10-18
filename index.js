const axios = require('axios');
const cheerio = require('cheerio')

exports.handler = async (event) => {
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
