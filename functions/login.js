'use strict';

const AWS = require('aws-sdk'); // eslint-disable-line import/no-extraneous-dependencies
const CryptoJS = require('crypto-js');
const dynamoDb = new AWS.DynamoDB.DocumentClient();

module.exports.logIn = (event, context, callback) => {
  const body = JSON.parse(event.body);
  let phone = body.phone;
  if(phone.startsWith('95')){
    phone = "0" + phone.slice(2,);
  };
  if(phone.startsWith('+95')){
    phone = "0" + phone.slice(3,);
  };
  const params = {
    TableName: process.env.USERSCREDENTIALS_TABLE,
    Key: {
      phone: phone
    },
  };

  // fetch credentials from the database
  dynamoDb.get(params, (error, result) => {
    // handle potential errors
    if (error) {
      console.error(error);
      callback(null, {
        statusCode: error.statusCode || 501,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(error),
      });
      return;
    }
    let decrypted = CryptoJS.AES.decrypt(result.Item.password, process.env.SECPASS).toString(CryptoJS.enc.Utf8) 
    if(phone === result.Item.phone && body.password === decrypted){
      // create a response
      const response = {
        statusCode: 200,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone,
          isAuthenticated: true,
          error: null
        }) 
      };
      callback(null, response);
    }
    else{
      const response = {
        statusCode: 501,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          isAuthenticated: false,
          error: "Incorrect Credentials."
        }) 
      };
      callback(null, response);
    }
  });
};
