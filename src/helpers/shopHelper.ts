require('dotenv').config()

import { dynamoClient } from '../services/database'

const tableName = process.env.DynamoTableName as string

export const getStores = async () => {
  var params = {
    TableName: tableName,
    FilterExpression: ' begins_with(#PK, :addRelation) ',
    ExpressionAttributeNames: { '#PK': 'pk' },
    ExpressionAttributeValues: { ':addRelation': 'STORE#' },
  }
  return await dynamoClient.scan(params).promise()
}
export const getSingleStore = async (id: string) => {
  var params: any = {
    TableName: tableName,
    FilterExpression: '#id = :idValue',
    ExpressionAttributeNames: { '#id': 'pk' },
    ExpressionAttributeValues: { ':idValue': id },
  }
  return await dynamoClient.scan(params).promise()
}

export const getCategories = async (id: string) => {
  var params: any = {
    TableName: tableName,
    FilterExpression: '#store = :storeId',
    ExpressionAttributeNames: { '#store': 'sk' },
    ExpressionAttributeValues: { ':storeId': id },
  }
  return await dynamoClient.scan(params).promise()
}

export const getItemsByCat = async (id: string) => {
  var params: any = {
    TableName: tableName,
    FilterExpression: '#cat = :catId',
    ExpressionAttributeNames: { '#cat': 'sk' },
    ExpressionAttributeValues: { ':catId': id },
  }
  return await dynamoClient.scan(params).promise()
}
export const getItemById = async (id: string) => {
  var params: any = {
    TableName: tableName,
    FilterExpression: '#item = :itemId',
    ExpressionAttributeNames: { '#item': 'pk' },
    ExpressionAttributeValues: { ':itemId': id },
  }
  return await dynamoClient.scan(params).promise()
}

export const searchCategories = async (term: string) => {
  var params: any = {
    TableName: tableName,
    FilterExpression: 'begins_with(#PK, :key) AND contains(#toSearch, :term)',
    ExpressionAttributeNames: { '#toSearch': 'title', '#PK': 'pk' },
    ExpressionAttributeValues: { ':term': term, ':key': 'CATRY#' },
  }
  return await dynamoClient.scan(params).promise()
}
export const searchStores = async (term: string) => {
  var params: any = {
    TableName: tableName,
    FilterExpression: 'begins_with(#PK, :key) AND contains(#toSearch, :term)',
    ExpressionAttributeNames: { '#toSearch': 'name', '#PK': 'pk' },
    ExpressionAttributeValues: { ':term': term, ':key': 'STORE#' },
  }
  return await dynamoClient.scan(params).promise()
}
export const searchItems = async (term: string) => {
  var params: any = {
    TableName: tableName,
    FilterExpression: 'begins_with(#PK, :key) AND contains(#toSearch, :term)',
    ExpressionAttributeNames: { '#toSearch': 'title', '#PK': 'pk' },
    ExpressionAttributeValues: { ':term': term, ':key': 'ITEM#' },
  }
  return await dynamoClient.scan(params).promise()
}
