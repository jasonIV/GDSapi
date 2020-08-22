'use strict';

const AWS = require('aws-sdk');
const dynamoDb = new AWS.DynamoDB.DocumentClient();

module.exports.balanceCheckOut = (event, context, callback) => {
  const body = JSON.parse(event.body);
  const message = body.message;
  const trans_id = body.trans_id;
  const user_agent = body.user_agent;
  const name = body.question_info.name;
  const price = body.question_info.price;
  const phone = body.question_info.phone;
  const question_type = body.question_info.question_type;
  const date_ = Date.now()
  const params = {
        TableName: process.env.USERSINFOS_TABLE,
        Key:{
            phone: user_agent
        },
        UpdateExpression: "set balance = balance - :num , transactions = list_append(if_not_exists(transactions, :empty_list), :data)",
        ConditionExpression: "balance >= :num",
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
  
  dynamoDb.update(params, (error, result) => {
    if (error) {
      console.error(error);
      callback(null, {
        statusCode: error.statusCode || 501,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(error)
      });
      return;
    }

    const response = {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(result.Attributes)
    }
    callback(null, response);
  })
}
