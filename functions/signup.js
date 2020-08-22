'use strict';
const AES = require('crypto-js/aes');
const AWS = require('aws-sdk'); // eslint-disable-line import/no-extraneous-dependencies

const dynamoDb = new AWS.DynamoDB.DocumentClient();

module.exports.signUp = (event, context, callback) => {
  const body = JSON.parse(event.body);
  let phone = body.phone
  if(phone.startsWith('95')){
    phone = "0" + phone.slice(2,)
  };
  if(phone.startsWith('+95')){
    phone = "0" + phone.slice(3,)
  };
  let password = AES.encrypt(body.password, process.env.SECPASS).toString();
  const params1 = {
    TableName: process.env.USERSCREDENTIALS_TABLE,
    Item: {
      username: body.username,
      phone,
      password,
    }
  }
  const params2 = {
    TableName: process.env.USERSINFOS_TABLE,
    Item: {
      username: body.username,
      phone,
      balance: 0,
      transactions: []
    }
  }

  dynamoDb.put(params1, (error) => {
    //handle potential errors
    if(error){
      callback(null, {
        statusCode: error.statusCode || 501,
        headers: { "Content-Type": "application/json"},
        body: JSON.stringify(error)
      });
      return;
    }
  });

  dynamoDb.put(params2, (error) => {
    //handle potential errors
    if(error){
      callback(null, {
        statusCode: error.statusCode || 501,
        headers: { "Content-Type": "application/json"},
        body: JSON.stringify(error)
      });
      return;
    }
    //create a response
    const response = {
      statusCode: 200,
      headers: { "Content-Type": "application/json"},
      body: "Signed up successfully."
    }
    callback(null, response);
  })
};
