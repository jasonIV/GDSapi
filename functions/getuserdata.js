const AWS = require('aws-sdk');

const dynamo = new AWS.DynamoDB.DocumentClient();

exports.handler = async (event, context) => {
    //console.log('Received event:', JSON.stringify(event, null, 2));
    console.log(event)

    let body;
    let statusCode = '200';
    const headers = {
        'Content-Type': 'application/json',
    };
    
    const params = {
        TableName: "GDSUsers",
        Key: {
            "phone": event.phone
        }
    }

    try {
        body = await dynamo.get(params).promise();
    } catch (err) {
        statusCode = '400';
        body = err.message;
    } finally {
        body = body
    }

    return {
        statusCode,
        body,
        headers,
    };
};
