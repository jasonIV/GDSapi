'use strict';

const AWS = require('aws-sdk');
const dynamoDb = new AWS.DynamoDB.DocumentClient();
const uuid = require('uuid');

module.exports.addBalance = (event, context, callback) => {
  const body = JSON.parse(event.body);
  let useragent = body.useragent;
  if(useragent.startsWith("95")){
      useragent = "0" + useragent.slice(2,);
  }
  if(useragent.startsWith("+95")){
      useragent = "0" + useragent.slice(3,);
  }
  const topup = parseInt(body.topup);
  const date_ = Date.now();
  const params1 = {
    TableName: process.env.USERSINFOS_TABLE,
    Key: {
      phone: useragent
    },
    ProjectExpression: "username"
  }
  const params2 = {
    TableName: process.env.USERSINFOS_TABLE,
    Key:{
        phone: useragent
    },
    UpdateExpression: "set balance = balance + :topup",
    ExpressionAttributeValues: {
        ":topup": topup
    },
    ReturnValues: "UPDATED_NEW"
  }
  dynamoDb.get(params1, (error, result) => {
    if (error) {
      console.error(error);
      callback(null, {
        statusCode: error.statusCode || 501,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(error),
      });
      return;
    }
    const username = result.Item.username;
    dynamoDb.put({
      Item: {
        id: uuid.v1(),
        username,
        useragent,
        topup,
        date: date_,
      },
      TableName: process.env.BALANCERECORDS_TABLE
    }, (error, result) => {
      if (error) {
        console.error(error);
        callback(null, {
          statusCode: error.statusCode || 501,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(error),
        });
        return;
      }
    })
    dynamoDb.update(params2, (error, result) => {
      if (error) {
        console.error(error);
        callback(null, {
          statusCode: error.statusCode || 501,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(error),
        });
        return;
      }
      const response = {
        statusCode: 200,
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Credentials': true,
        },
        body: JSON.stringify(result.Attributes)
      }
      callback(null, response);
    })
  })
}
