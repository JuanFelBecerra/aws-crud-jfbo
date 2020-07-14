const AWS = require("aws-sdk");

const documentClient = new AWS.DynamoDB.DocumentClient();

const headers = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'DELETE, HEAD, OPTIONS'
};

//Environment variables
const AwsCustomerTable = process.env.AWS_DYNAMO_TABLE_CUSTOMER;

exports.handler = async (event, context) => {

    const queryParams = event.queryStringParameters;

    if (!queryParams || !queryParams.id) {
        return sendResponse(400, {
            message: 'The id parameter is necessary to remove!'
        });
    }

    const params = {
        TableName: AwsCustomerTable,
        Key: {"id": queryParams.id}
    };

    try {

        const data = await getCustomer(params);

        if (!data.Item) {
            return sendResponse(404, {
                message: 'Custmoer does not exist!'
            });
        } else {
            await documentClient.delete(params).promise();
            return sendResponse(200, {
                message: 'Customer removed'
            });
        }
    } catch (e) {
        console.log('Internal server error ' + e);
        return sendResponse(500, {
            message: `Internal server error: ${e}`
        });
    }
}

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