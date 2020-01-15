# Xero Node - Barebones Node/Express app

This shows a very barebones usage of the xero-node SDK.

You will need to replace the following from an app in your Xero developer portal: https://developer.xero.com/myapps/

```javascript
const client_id = 'your-client-id'
const client_secret = 'your-client-secret'
const redirectUri = 'your-callback-from-developer-portal-oauth2-app-settings'
```

# Dependencies
* node
* express
* express-session
* xero-node

# Features
* Oauth2.0 authorization
* single API Call to `getOrganisations`

For a more feature rich version of the SDK usage please checkout https://github.com/XeroAPI/xero-node-oauth2-app

# Run Local
`node index.js`
