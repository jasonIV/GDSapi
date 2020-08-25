const AWS = require('aws-sdk');

const dynamo = new AWS.DynamoDB.DocumentClient();

exports.handler = async (event, context) => {
    //console.log('Received event:', JSON.stringify(event, null, 2));

    let body;
    let statusCode = '200';
    const headers = {
        'Content-Type': 'application/json',
    };
    
    const username= event.username;
    let phone = event.phone;
    if(phone.startsWith("95")){
        phone = phone.slice(2,);
        phone = "0" + phone;
    }
    if(phone.startsWith("+95")){
        phone = phone.slice(3,);
        phone = "0" + phone;
    }
    const password = event.password;
    const encodedPassword = new Buffer(password).toString('base64');
    const gds_balance = 0;
    const params1 = {
        Item: {
            phone: phone,
            password: encodedPassword
        },
        TableName: "GDSCredentials"
    }
    
    const params2 = {
        Item: {
            username: username,
            phone: phone,
            gds_balance: gds_balance,
            transactions: []
        },
        TableName: "GDSUsers"
    }

    try {
        body = await dynamo.put(params1).promise();
        body = await dynamo.put(params2).promise();
        body = {
            isSignedUp: true
        }
    } catch (err) {
        statusCode = '400';
        body = err.message;
    } finally {
        body = body;
    }

    return {
        statusCode,
        body,
        headers,
    };
};
