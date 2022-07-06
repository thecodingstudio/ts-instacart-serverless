require('dotenv').config()

import { dynamoClient } from '../services/database'

const tableName = process.env.DynamoTableName as string

export const create = async (data: any) => {
  const params: any = {
    TableName: tableName,
    Item: data,
  }
  return await dynamoClient.put(params).promise()
}

export const update = async (data: any) => {
  const params = {
    TableName: tableName,
    Item: data,
  }
  return await dynamoClient.put(params).promise()
}

export const getUserByEmail = async (email: string) => {
  var params: any = {
    TableName: tableName,
    FilterExpression: '#email = :emailValue',
    ExpressionAttributeNames: { '#email': 'email' },
    ExpressionAttributeValues: { ':emailValue': email },
  }
  return await dynamoClient.scan(params).promise()
}

export const getUserByNumber = async (
  country_code: string,
  phone_number: string,
) => {
  var params: any = {
    TableName: tableName,
    FilterExpression: '#phone = :phoneValue ',
    ExpressionAttributeNames: { '#phone': 'phone_number' },
    ExpressionAttributeValues: { ':phoneValue': country_code + phone_number },
  }
  return await dynamoClient.scan(params).promise()
}

export const getUserById = async (id: string) => {
  var params: any = {
    TableName: tableName,
    FilterExpression: '#id = :idValue',
    ExpressionAttributeNames: { '#id': 'pk' },
    ExpressionAttributeValues: { ':idValue': id },
  }
  return await dynamoClient.scan(params).promise()
}

export const getUserByToken = async (token: string) => {
  var params: any = {
    TableName: tableName,
    FilterExpression: '#token = :tokenvalue',
    ExpressionAttributeNames: {
      '#token': 'resetToken',
    },
    ExpressionAttributeValues: { ':tokenvalue': token },
  }
  return await dynamoClient.scan(params).promise()
}

export const getUserByAccessToken = async (token: string) => {
  var params: any = {
    TableName: tableName,
    FilterExpression: '#token = :tokenvalue',
    ExpressionAttributeNames: {
      '#token': 'accessToken',
    },
    ExpressionAttributeValues: { ':tokenvalue': token },
  }
  return await dynamoClient.scan(params).promise()
}

export const deleteItemById = async (pk: string, sk: string) => {
  var params = {
    TableName: tableName,
    Key: {
      pk,
      sk,
    },
  }
  return await dynamoClient.delete(params).promise()
}

export const getOrderByUser = async (id: string) => {
  var params: any = {
    TableName: tableName,
    FilterExpression: '#SK = :idValue AND begins_with(#PK, :addRelation)',
    ExpressionAttributeNames: { '#SK': 'sk', '#PK': 'pk' },
    ExpressionAttributeValues: { ':idValue': id, ':addRelation': 'ORD#' },
  }
  return await dynamoClient.scan(params).promise()
}
export const getOrderitemsByOrder = async (id: string) => {
  var params = {
    TableName: tableName,
    FilterExpression: ' begins_with(#PK, :addRelation) AND #SK = :ordId',
    ExpressionAttributeNames: { '#PK': 'pk', '#SK': 'sk' },
    ExpressionAttributeValues: { ':addRelation': 'OITEM#', ':ordId': id },
  }
  return await dynamoClient.scan(params).promise()
}
