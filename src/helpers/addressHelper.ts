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

export const getAddressById = async (id: string) => {
  var params: any = {
    TableName: tableName,
    FilterExpression: '#id = :idValue',
    ExpressionAttributeNames: { '#id': 'pk' },
    ExpressionAttributeValues: { ':idValue': id },
  }
  return await dynamoClient.scan(params).promise()
}
export const getAddressByUser = async (id: string) => {
  var params: any = {
    TableName: tableName,
    FilterExpression: '#SK = :idValue AND begins_with(#PK, :addRelation)',
    ExpressionAttributeNames: { '#SK': 'sk', '#PK': 'pk' },
    ExpressionAttributeValues: { ':idValue': id, ':addRelation': 'ADDR#' },
  }
  return await dynamoClient.scan(params).promise()
}

export const getAddressByIdAndUser = async (id: string, userId: string) => {
  var params: any = {
    TableName: tableName,
    FilterExpression: '#addressId = :addressVal AND #userId = :userValue',
    ExpressionAttributeNames: { '#addressId': 'pk', '#userId': 'sk' },
    ExpressionAttributeValues: { ':addressVal': id, ':userValue': userId },
  }
  return await dynamoClient.scan(params).promise()
}
export const getActiveAddresses = async (userId: string) => {
  var params: any = {
    TableName: tableName,
    FilterExpression: '#userId = :userValue AND #active = :val',
    ExpressionAttributeNames: { '#userId': 'sk', '#active': 'is_active' },
    ExpressionAttributeValues: { ':userValue': userId, ':val': 1 },
  }
  return await dynamoClient.scan(params).promise()
}
