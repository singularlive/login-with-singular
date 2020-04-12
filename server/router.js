var superagent = require('superagent');

var SINGULAR_SERVER = 'https://app.singular.live';
var CLIENT_ID = '472ea7a03e788befb6454f5a2c462eff73f3318b5217e576a368c4e3d93e41ed2e805da9c47d0160015dccb0389ac7c4'; // '[ENTER_YOUR_CLIENT_ID]';
var CLIENT_SECRET = '672b220b1becaabc1911e4d79e6df9030422e73c5ee4dde36e6dd367801dedac102480a9d1b3d7551ac49070b069e751'; // '[ENTER_YOUR_CLIENT_SECRET]';


module.exports = function (app) {

  // Startup page
  app.get('/', function (req, res) {
    res.render('index', {
      singularEndpoint: SINGULAR_SERVER + '/oauth/logindialog?client_id=' + CLIENT_ID
    });
  });

  // Callback
  app.get('/callback', function (req, res) {
    if (req.query.action && req.query.action == 'logout') {
      res.redirect('/');
      return;
    }
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
          // Sample call to get logged in user info
          // Access token should be kept in your database
          var accessToken = tokenRes.body.access_token;
          superagent.get(SINGULAR_SERVER + '/apiv1/users/me').set('Authorization', 'Bearer ' + accessToken).end(function(userErr, userRes) {
            res.render('demo', {
              user: userRes.body,
              singularUrlBase: SINGULAR_SERVER,
              singularLogoutEndpoint: SINGULAR_SERVER + '/users/logout?client_id=' + CLIENT_ID
            });
          });
        }
      });
  });
};
