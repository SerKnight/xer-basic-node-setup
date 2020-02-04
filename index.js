'use strict';

const express = require('express');
const session = require('express-session');
const xero_node = require('xero-node')

const client_id = '< replace >'
const client_secret = '< replace >'
const redirectUri = 'http://localhost:8080/callback'
const scopes = 'openid email profile offline_access accounting.transactions accounting.contacts'

const xero = new xero_node.XeroClient({
  clientId: client_id,
  clientSecret: client_secret,
  redirectUris: [redirectUri],
  scopes: scopes.split(" ")
});

let app = express()

app.set('port', (process.env.PORT || 3000))
app.use(express.static(__dirname + '/public'))
app.use(session({
  secret: 'something crazy',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false }
}));

app.get('/', function(req, res) {
  res.send('<a href="/connect">Connect to Xero</a>');
})

app.get('/connect', async function(req, res) {
  try {
    let consentUrl = await xero.buildConsentUrl();
    res.redirect(consentUrl + "&state=THIS_IS_A_STANDARD_OAUTH_2_STATE_PARAMETER"); // Append any type of state/params you would like
  } catch (err) {
    res.send("Sorry, something went wrong");
  }
})

app.get('/callback', async function(req, res) {
  let url = redirectUri + req.originalUrl;

  console.log('req.query: ', req.query) // this will the the same state/params you passed to the API

  await xero.buildConsentUrl();
  await xero.setAccessTokenFromRedirectUri(url);

  // (optional) get user info from the id token
  let tokenClaims = await xero.readIdTokenClaims();
  const accessToken = await xero.readTokenSet();

  req.session.tokenClaims = tokenClaims;
  req.session.accessToken = accessToken;
  req.session.xeroTenantId = xero.tenantIds[0];

  res.redirect('/organisation');
})

app.get('/organisation', async function(req, res) {
  try {
    const response = await xero.accountingApi.getOrganisations(xero.tenantIds[0])
    res.send("Hello, " + response.body.organisations[0].name);
  } catch (err) {
    res.send(err);
  }
})

const PORT = process.env.PORT || 8080;
app.listen(PORT, function() {
  console.log("Your Xero basic public app is running at localhost:" + PORT)
})