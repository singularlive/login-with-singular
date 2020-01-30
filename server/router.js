var superagent = require('superagent');

var SINGULAR_SERVER = 'https://app.singular.live';
//var SINGULAR_SERVER = 'http://localhost:3000';
var CLIENT_ID = '472ea7a03e788befb6454f5a2c462eff73f3318b5217e576a368c4e3d93e41ed2e805da9c47d0160015dccb0389ac7c4'; // '[ENTER_YOUR_CLIENT_ID]'
var CLIENT_SECRET = '6e463f8529f733c2c7b7abd14a7976ba1255294db77c2574ddbb71f4e0568fd9dda4b3abb04929cbfb4683b32361ee8d'; // '[ENTER_YOUR_CLIENT_SECRET]'

module.exports = function (app) {

  // Startup page
  app.get('/', function (req, res) {
    res.render('index', {
      singularEndpoint: SINGULAR_SERVER + '/oauth/logindialog?client_id=' + CLIENT_ID
    });
  });

  // Callback
  app.get('/callback', function (req, res) {
    if (!req.query.code) {
      res.status(400).json('No code provided');
      return;
    }

    superagent.post(SINGULAR_SERVER + '/oauth/accesstoken')
      .send({
        code: req.query.code,
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET
      })
      .end(function (tokenErr, tokenRes) {
        if (tokenErr) {
          console.log(tokenErr, tokenRes);
          res.status(500).json('Error from Singular Token');
        } else {
          // Sample call to get loggedin user info
          // Access token should be kept in your database
          var accessToken = tokenRes.body.access_token;
          //console.log(accessToken);
          superagent
          .get(SINGULAR_SERVER + '/apiv1/users/me')
          .set('Authorization', 'Bearer ' + accessToken)
          .end(function(userErr, userRes) {
            //console.log(userRes.body);
            res.send('Your name is ' + userRes.body.name + ' with email address ' + userRes.body.email 
              + '<br/><a href="https://app.singular.live/users/logout">Logout</a>');
          });
        }
      });
  });
};
