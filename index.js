'use strict';

const express = require('express');
const session = require('express-session');
const  xero_node = require('xero-node')

const client_id = 'your-client-id'
const client_secret = 'your-client-secret'
const redirectUri = 'your-callback-from-developer-portal-oauth2-app-settings'
const scopes = 'openid profile email accounting.transactions accounting.settings offline_access'

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
    res.redirect(consentUrl);
  } catch (err) {
    res.send("Sorry, something went wrong");
  }
})

app.get('/callback', async function(req, res) {
  const url = "http://localhost:5000/" + req.originalUrl;
  await xero.setAccessTokenFromRedirectUri(url);

  // Optional: read user info from the id token
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
    res.send("Sorry, something went wrong");
  }
})

const PORT = process.env.PORT || 5000;
app.listen(PORT, function() {
  console.log("Your Xero basic public app is running at localhost:" + PORT)
})