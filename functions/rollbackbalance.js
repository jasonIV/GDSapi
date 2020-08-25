const AWS = require('aws-sdk');

const dynamo = new AWS.DynamoDB.DocumentClient();

exports.handler = async (event, context) => {
    //console.log('Received event:', JSON.stringify(event, null, 2));

    let body;
    let rollbackBalance;
    let useragent;
    let statusCode = '200';
    const headers = {
        'Content-Type': 'application/json',
    };
    const _date = event.date;
    const params = {
        Key: {
            date: _date,
            sort: _date
        },
        TableName: "BalanceRecords"
    };
    try {
        body = await dynamo.get(params).promise();
        rollbackBalance = body.Item.topup;
        useragent = body.Item.useragent;
        body = await dynamo.delete(params).promise();
        body = await dynamo.update({
            TableName: "GDSUsers",
            Key: {
                phone: useragent,
            },
            UpdateExpression: "SET gds_balance = gds_balance - :val",
            ConditionExpression: "gds_balance >= :val",
            ExpressionAttributeValues: {
                ":val": rollbackBalance
            },
            ReturnValues: "UPDATED_NEW"
        }).promise()
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
