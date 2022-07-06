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
