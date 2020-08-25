const AWS = require('aws-sdk');

const dynamo = new AWS.DynamoDB.DocumentClient();

exports.handler = async (event, context) => {
    //console.log('Received event:', JSON.stringify(event, null, 2));

    let body;
    let statusCode = '200';
    const headers = {
        'Content-Type': 'application/json',
    };

    try {
        body = await dynamo.scan({ TableName: "BalanceRecords"}).promise();
    } catch (err) {
        statusCode = '400';
        body = err.message;
    } 

    return {
        statusCode,
        body,
        headers,
    };
};
