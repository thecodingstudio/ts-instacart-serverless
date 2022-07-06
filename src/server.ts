import express from 'express'

import serverless from 'serverless-http'

import cors from 'cors'
import bodyParser from 'body-parser'
import path from 'path'

const app = express()

import * as authRoutes from './routes/authRoutes'
import * as userRoutes from './routes/userRoutes'
import * as shopRoutes from './routes/shopRoutes'
app.use(cors())
app.use(express.json())
app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE')
  res.setHeader(
    'Access-Control-Allow-Headers',
    'Content-Type, Authorization, Accept',
  )
  next()
})
app.set('view engine', 'ejs')
app.set('views', 'views')
app.set('views', path.join(__dirname, 'views'))

app.use('/auth', authRoutes.default)
app.use('/user', userRoutes.default)
app.use('/shop', shopRoutes.default)

// app.listen(3000, (_port: void) => {
//   console.log('Server running on port : ' + 3000)
// })
export const handler = serverless(app)
