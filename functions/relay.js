'use strict';

const axios = require('axios');

module.exports.relay = (event, context, callback) => {
  const body = JSON.parse(event.body);
  const url = "https://agent_api.mintheinkha.com/agent/demo/request";
  axios.post(url, body)
  .then(res => {
    const response = {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(res.data)
    }
    callback(null, response);
  })
  .catch(err => {
    console.log(err)
    const response = {
      statusCode: err.statusCode || 501,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(err)
    }
    callback(null, response);
  })
}
