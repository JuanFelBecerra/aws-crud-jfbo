const AWS = require("aws-sdk");

const documentClient = new AWS.DynamoDB.DocumentClient();

const headers = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'PUT, HEAD, OPTIONS'
};

//Environment variables
const AwsCustomerTable = process.env.AWS_DYNAMO_TABLE_CUSTOMER;

exports.handler = async (event, context) => {

    const {
        id,
        identification,
        idType,
        name,
        lastName,
        age,
        city
    } = JSON.parse(event.body);

    if (!id) {
        return sendResponse(400, {
            message: 'id is required!'
        });
    }

    if (!identification) {
        return sendResponse(400, {
            message: 'identification is required!'
        });
    }

    const params = {
        TableName: AwsCustomerTable,
        Key: {"id": id},
        ReturnValues:"UPDATED_NEW"
    };

    try {

        const data = await getCustomer(params);

        console.log(JSON.stringify(data.Item));

        if (!data.Item) {
            return sendResponse(404, {
                message: 'Custmoer does not exist!'
            });
        }

        if(data.Item.identification != identification){
            return sendResponse(400, {
                message: 'identification does not match!'
            });
        } else {
            params.UpdateExpression = "set #name = :n, #lastName = :ln, #identificationType = :it,#city = :c, #age = :a";
            params.ExpressionAttributeNames = {
                "#name": "name",
                "#lastName": "lastName",
                "#identificationType": "identificationType",
                "#city": "city",
                "#age": "age",
            };
            params.ExpressionAttributeValues = {
                ":n": name,
                ":ln": lastName,
                ":it": idType,
                ":c": city,
                ":a": age
            };

            const response = await documentClient.update(params).promise();

            return sendResponse(200, {
                message: 'Updated customer',
                response
            });
        }       
    } catch (e) {
        console.log('Internal server error ' + e);
        return sendResponse(500, {
            message: `Internal server error: ${e}`
        });
    }
};

const getCustomer = (params) => {
    return documentClient.get(params).promise();
};

const sendResponse = (statusCode, body = null) =>  {
  const response = {
      statusCode, 
      body: JSON.stringify(body),
      headers
  };
  
  return response;
};