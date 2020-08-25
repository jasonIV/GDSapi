const AWS = require('aws-sdk');

const dynamo = new AWS.DynamoDB.DocumentClient();

exports.handler = async (event, context) => {
    //console.log('Received event:', JSON.stringify(event, null, 2));

    let body;
    let username;
    let useragent = event.useragent;
    if(useragent.startsWith("95")){
        useragent = useragent.slice(2,);
        useragent = "0" + useragent;
    }
    if(useragent.startsWith("+95")){
        useragent = useragent.slice(3,);
        useragent = "0" + useragent;
    }
    const topup = parseInt(event.topup);
    const date_ = Date.now();
    
    const payload1 = {
        TableName: "GDSUsers",
        Key:{
            phone: useragent
        },
        UpdateExpression: "set gds_balance = gds_balance + :topup",
        ExpressionAttributeValues: {
            ":topup": topup
        },
        ReturnValues: "UPDATED_NEW"
    }
    
    try {
        body = await dynamo.get({
            TableName: "GDSUsers",
            Key: {
                phone: useragent
            },
            ProjectionExpression: "username"
        }).promise()
        username = body.Item.username;
        body = await dynamo.put({
        Item: {
            username,
            useragent,
            topup,
            date: date_,
            sort: date_
        },
        TableName: "BalanceRecords",
        }).promise();
        body = await dynamo.update(payload1).promise();
    } catch (err) {
        body = err.message;
    } 

    return body;
};
