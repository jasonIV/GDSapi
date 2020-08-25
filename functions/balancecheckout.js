const AWS = require('aws-sdk');

const dynamo = new AWS.DynamoDB.DocumentClient();

exports.handler = async (event, context) => {
    //console.log('Received event:', JSON.stringify(event, null, 2));
    console.log(event);
    let body;
    let statusCode = '200';
    const headers = {
        'Content-Type': 'application/json',
    };
    
    const message = event.message;
    const trans_id = event.trans_id;
    const user_agent = event.user_agent;
    const name = event.question_info.name;
    const price = parseInt(event.question_info.price);
    const phone = event.question_info.phone;
    const question_type = event.question_info.question_type;
    const date_ = Date.now()
    
    const payload = {
        TableName: "GDSUsers",
        Key:{
            phone: user_agent
        },
        UpdateExpression: "set gds_balance = gds_balance - :num , transactions = list_append(if_not_exists(transactions, :empty_list), :data)",
        ConditionExpression: "gds_balance >= :num",
        ExpressionAttributeValues:{
            ":data": [{
                "status_": 1,
                "message": message,
                "trans_id": trans_id,
                "user_agent": user_agent,
                "name_": name,
                "price": price,
                "phone": phone,
                "question_type": question_type,
                "date_": date_
            }],
            ":empty_list": [],
            ":num": price,
        },
        ReturnValues:"UPDATED_NEW"
    }

    try {
         body = await dynamo.update(payload).promise();
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
