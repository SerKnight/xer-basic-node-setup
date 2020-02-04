'use strict';

const express = require('express');
const xero_node = require('xero-node')

const client_id = 'CLIENT_ID'
const client_secret = 'CLIENT_SECRET'
const redirectUri = 'REDIRECT_URI'
const scopes = 'openid profile email accounting.transactions accounting.settings offline_access'

const xero = new xero_node.XeroClient({
  clientId: client_id,
  clientSecret: client_secret,
  redirectUris: [redirectUri],
  scopes: scopes.split(" ")
});

console.log(xero.config.scopes);

let app = express()

app.set('port', (process.env.PORT || 3000))
app.use(express.static(__dirname + '/public'))

console.log(xero.config.scopes);

app.get('/', function (req, res) {

  console.log(xero.config.scopes);

  res.send('<a href="/connect">Connect to Xero</a>');
})

app.get('/connect', async function (req, res) {
  try {

    console.log(xero.config.scopes);

    let consentUrl = await xero.buildConsentUrl();
    res.redirect(consentUrl);
  } catch (err) {
    res.send("Sorry, something went wrong");
  }
})

app.get('/callback', async function (req, res) {
  const url = "http://localhost:5000/" + req.originalUrl;
  await xero.setAccessTokenFromRedirectUri(url);

  console.log(xero.config.scopes);

  // Optional: read user info from the id token
  let tokenClaims = await xero.readIdTokenClaims();
  const accessToken = await xero.readTokenSet();

  res.redirect('/organisation');
})

app.get('/organisation', async function (req, res) {
  try {

    console.log(xero.config.scopes);

    const response = await xero.accountingApi.getOrganisations(xero.tenantIds[0])
    res.send("Hello, " + response.body.organisations[0].name);
  } catch (err) {
    res.send("Sorry, something went wrong");
  }
})

const PORT = process.env.PORT || 5000;

console.log(xero.config.scopes);

app.listen(PORT, function () {
  console.log("Your Xero basic public app is running at localhost:" + PORT)
})
