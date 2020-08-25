const AWS = require('aws-sdk');

const dynamo = new AWS.DynamoDB.DocumentClient();

exports.handler = async (event, context) => {
    //console.log('Received event:', JSON.stringify(event, null, 2));
    let body;
    let statusCode = '200';
    const headers = {
        'Content-Type': 'application/json',
    };
    
    let phone = event.phone;
    if(phone.startsWith("95")){
        phone = phone.slice(2,);
        phone = "0" + phone;
    }
    if(phone.startsWith("+95")){
        phone = phone.slice(3,);
        phone = "0" + phone;
    }
    let password = event.password;
    
    try{
        let payload = await dynamo.get({Key: {phone: phone},TableName: "GDSCredentials"}).promise();
        if(phone == payload.Item.phone && password === new Buffer(payload.Item.password,'base64').toString('ascii')){
            body = {
                phone: phone,
                isAuthenticated: true,
                error: null
            };
        }
        else{
            statusCode = "400"
            body = "Incorrect Credentials."
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
