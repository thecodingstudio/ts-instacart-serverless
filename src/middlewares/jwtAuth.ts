import * as jwt from 'jsonwebtoken'
import { Request, Response, NextFunction } from 'express'
import { globals, globalResponse } from '../util/const'
import { errorResponse } from '../util/response'
import * as userHelper from '../helpers/userHelper'

export const jwtAuth = async (req: any, res: any, next: NextFunction) => {
  let token = req.get('Authorization')
  if (token) {
    token = token.split(' ')[1]

    const user = await userHelper.getUserByAccessToken(token)

    if (user.Items?.length == 0) {
      return errorResponse(
        res,
        globals.StatusUnauthorized,
        globalResponse.Unauthorized,
        null,
      )
    }

    if (process.env.secret != undefined) {
      jwt.verify(token, process.env.secret, (err: any, user: any) => {
        if (!err) {
          if (user && token) {
            req.user = user.user
          }
          next()
        }
      })
    }
  } else {
    return errorResponse(
      res,
      globals.StatusUnauthorized,
      globalResponse.Unauthorized,
      null,
    )
  }
}
