## Install the packages

``` bash
npm install
```

## Getting API Key

1. Register an account at [Eden AI](https://www.edenai.co/)
2. Go to API Settings->API Token
3. Copy the API token

## Pasting API Key
1. Go to src/audioGenerator.js
2. Locate line 12

``` javascript
authorization: "Bearer api_key",
```

3. Replace api_key with your API token

## Run The Server

1. Go to the backend directory (assuming you are in CMPM-146-Game-AI-Final-Project folder)

``` bash
cd backend
```

2. Use the following command to start up the server

``` bash
npm start
```

3. Head over to the [API docs](http://localhost:3010/v0/api-docs/) to see the requests you can make