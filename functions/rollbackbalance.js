'use strict';

const AWS = require('aws-sdk');
const dynamoDb = new AWS.DynamoDB.DocumentClient();

module.exports.rollbackBalance = (event, context, callback) => {
  const body = JSON.parse(event.body);
  const id = body.id;
  const params = {
    TableName: process.env.BALANCERECORDS_TABLE, 
    Key: {
      id
    }
  }
  dynamoDb.get(params,(error, result) => {
    if (error) {
      console.error(error);
      callback(null, {
        statusCode: error.statusCode || 501,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(error),
      });
      return;
    }
    const rollbackBalance = result.Item.topup;
    const useragent = result.Item.useragent;
    dynamoDb.delete(params, (error) => {
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
    dynamoDb.update({
      TableName: process.env.USERSINFOS_TABLE,
      Key: {
        phone: useragent,
      },
      UpdateExpression: "SET balance = balance - :val",
      ConditionExpression: "balance >= :val",
      ExpressionAttributeValues: {
          ":val": rollbackBalance
      },
      ReturnValues: "UPDATED_NEW"
    },(error, result) => {
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
      body: JSON.stringify(result)
    }
    callback(null, response);
    })
  })
}
