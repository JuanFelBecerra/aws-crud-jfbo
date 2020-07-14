const AWS = require("aws-sdk");
const crypto = require("crypto");

const documentClient = new AWS.DynamoDB.DocumentClient();

const headers = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, HEAD, OPTIONS'
};

//Environment variables
const AwsCustomerTable = process.env.AWS_DYNAMO_TABLE_CUSTOMER;

exports.handler = async (event, context) => {

  const itemDate = new Date().toLocaleString("en-US", {timeZone: "America/Bogota"});
               
  //console.log(itemDate);

  const {
    identification,
    idType,
    name,
    lastName,
    age,
    city
  } = JSON.parse(event.body);

  if (!identification) {
    return sendResponse(400, {
      message: 'identification is required'
    });
  }

  const params = {
    TableName: AwsCustomerTable,
    Item: {
      id: crypto.randomBytes(16).toString("hex"),
      identification: identification,
      identificationType: idType,
      name: name,
      lastName: lastName,
      age: age,
      city: city,
      creationDate: itemDate.toString()
    },
    ConditionExpression: "attribute_not_exists(id)"
  };

  try {
    
    const data = await documentClient.put(params).promise();

    return sendResponse(201, {message: 'New customer created'});

  } catch (e) {
    console.log('Internal server error '+e);
    return sendResponse(500, {message: `Internal server error: ${e}`});
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