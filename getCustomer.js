const AWS = require("aws-sdk");

const documentClient = new AWS.DynamoDB.DocumentClient();

const headers = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, HEAD, OPTIONS'
};

//Environment variables
const AwsCustomerTable = process.env.AWS_DYNAMO_TABLE_CUSTOMER;

exports.handler = async (event, context) => {

    const queryParams = event.queryStringParameters;
    const params = {
        TableName: AwsCustomerTable
    };

    if (!queryParams) {
        return sendResponse(400, {
            message: 'parameters are required for the query!'
        });
    }

    if (queryParams && queryParams.identification) {
        params.FilterExpression = "#identification = :identification";
        params.ExpressionAttributeNames = {"#identification": "identification"};
        params.ExpressionAttributeValues = {":identification": `${queryParams.identification}`};
    }

    if (queryParams && queryParams.age) {
        params.FilterExpression = "#age >= :age";
        params.ExpressionAttributeNames = {"#age": "age"};
        params.ExpressionAttributeValues = {":age": `${queryParams.age}`};
    }

    if (queryParams && queryParams.identification && queryParams.age) {
        params.FilterExpression = "#identification = :identification and #age >= :age";
        params.ExpressionAttributeNames = {
            "#identification": "identification",
            "#age": "age"
        };
        params.ExpressionAttributeValues = {
            ":identification": `${queryParams.identification}`,
            ":age": `${queryParams.age}`
        };
    }

    try {

        const data = await documentClient.scan(params).promise();
        //console.log("Get Method: "+JSON.stringify(data.Items));
        const clients = data.Items;

        if (clients && clients != "") {
            return sendResponse(200, {
                message: 'Customer found',
                clients
            });
        } else {
            return sendResponse(200, {
                message: 'Customer not found'
            });
        }

    } catch (e) {
        console.log('Internal server error ' + e);
        return sendResponse(500, {
            message: `Internal server error: ${e}`
        });
    }
};

const sendResponse = (statusCode, body = null) =>  {
  const response = {
      statusCode, 
      body: JSON.stringify(body),
      headers
  };
  
  return response;
};