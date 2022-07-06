declare global {
  namespace NodeJS {
    interface ProcessEnv {
      MYSQL_USER: string
      MYSQL_PASSWORD: string
      MYSQL_DATABASE: string
      secret: string
      jwtExpiration: string
      refSecret: string
      jwtRefExpiration: string
      accountSID: string
      serviceID: string
      authToken: string
      mjapi: string
      mjsecret: string
      STRIPE_SK: string
      BucketName: string
      AWSBucketRegion: string
      AWSUserAccessKey: string
      AWSUserSecretKey: string
      DynamoTableName: string
    }
  }
}
export {}
