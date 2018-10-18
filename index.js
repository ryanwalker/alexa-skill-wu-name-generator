const axios = require('axios');
const cheerio = require('cheerio')

console.log('Trying...');
axios.post(
  'https://recordstore.com/wuname.pl',
  'fname=Ryan&sname=Walker'
)
.then(function(response) {
  var datums = response.data
  const $ = cheerio.load(datums)
  const wuName = $('span.newname').text();
  console.log(wuName);
})
.catch(function (error) {
  console.log(error);

});




exports.handler = async (event) => {
    var firstName = event.firstName;
    var lastName = event.lastName;

    var instance = axios.create({
      baseURL: 'https://www.recordstore.com/',
      timeout: 1000,
      headers: {
        'Content-Type' : 'application/x-www-form-urlencoded'
      }
    });

    axios.post('wuname.pl',
    'fname=Ryan&sname=Walker')
    .then(function(response) {
      console.log(response);
    })
    .catch(function (error) {

    });

    const response = {

        statusCode: 200,
        body: JSON.stringify('Ok, ' + firstName + ' ' + lastName +
        '. I\'ll retrieve your Wu Name.')
    };
    return response;
};
