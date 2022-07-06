import * as AWS from 'aws-sdk'

require('dotenv').config()

AWS.config.update({
  region: process.env.AWSBucketRegion,
  accessKeyId: process.env.AWSUserAccessKey,
  secretAccessKey: process.env.AWSUserSecretKey,
})

export const dynamoClient = new AWS.DynamoDB.DocumentClient()
