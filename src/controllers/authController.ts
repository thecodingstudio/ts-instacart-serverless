require('dotenv').config()

import * as bcrypt from 'bcryptjs'
import crypto from 'crypto'
import * as userHelper from '../helpers/userHelper'
import { generateId } from '../services/userId'
import { globals, globalResponse } from '../util/const'
import { successResponse, errorResponse } from '../util/response'
import Stripe from 'stripe'
import { Twilio } from 'twilio'
import { validationResult } from 'express-validator/check'
import * as jwt from 'jsonwebtoken'
import * as mail from 'node-mailjet'
const mailjet = mail.connect(
  process.env.mjapi as string,
  process.env.mjsecret as string,
)

const stripe = new Stripe(process.env.STRIPE_SK as string, {
  apiVersion: '2020-08-27',
})

const client = new Twilio(
  process.env.accountSID as string,
  process.env.authToken as string,
)

export const signup = async (req: any, res: any, next: any) => {
  const errors = validationResult(req)

  if (!errors.isEmpty()) {
    return errorResponse(
      res,
      globals.StatusBadRequest,
      errors.array()[0].msg,
      null,
    )
  }
  try {
    const userData: any = {
      email: req.body.email,
      password: req.body.password,
      pk: 'U#' + generateId(6),
      sk: '-',
    }

    const user = await userHelper.getUserByEmail(req.body.email)
    if (user.Items?.length !== 0) {
      return errorResponse(
        res,
        globals.StatusBadRequest,
        globalResponse.UserExist,
        undefined,
      )
    } else {
      bcrypt.hash(req.body.password, 10, async (err: any, hash: any) => {
        if (err) {
          console.log(err)
          return errorResponse(
            res,
            globals.StatusBadRequest,
            globalResponse.Error,
            undefined,
          )
        }
        userData.password = hash

        const customer = await stripe.customers.create({
          email: req.body.email,
          description: 'Insta-Cart Customer!',
        })

        userData.stripe_id = customer.id
        await userHelper.create(userData)

        return successResponse(
          res,
          globals.StatusCreated,
          globalResponse.RegistrationSuccess,
          undefined,
        )
        // const resp = {
        //   statusCode: 200,
        //   body: JSON.stringify('User Created!'),
        // }
        // return resp
      })
    }
  } catch (error) {
    console.log(error)
    return errorResponse(
      res,
      globals.StatusInternalServerError,
      globalResponse.ServerError,
      undefined,
    )
  }
}

export const login = async (req: any, res: any, next: any) => {
  const errors = validationResult(req)

  if (!errors.isEmpty()) {
    return errorResponse(
      res,
      globals.StatusBadRequest,
      errors.array()[0].msg,
      null,
    )
  }
  try {
    const test: any = await userHelper.getUserByEmail(req.body.email)
    if (!test || test == null || test == undefined) {
      return errorResponse(
        res,
        globals.StatusNotFound,
        globalResponse.UserNotFound,
        null,
      )
    }

    const passCheck = await bcrypt.compare(
      req.body.password,
      test.Items[0].password,
    )

    if (!passCheck) {
      return errorResponse(
        res,
        globals.StatusBadRequest,
        globalResponse.InvalidCredentials,
        null,
      )
    }

    const userForToken = { ...test.Items[0] }
    delete userForToken.accessToken
    delete userForToken.refreshToken

    const accessToken = jwt.sign(
      { user: userForToken },
      process.env.secret as string,
      {
        expiresIn: process.env.jwtExpiration as string,
      },
    )
    const refreshToken = jwt.sign(
      { user: userForToken },
      process.env.refSecret as string,
      { expiresIn: process.env.jwtRefExpiration as string },
    )

    test.Items[0].accessToken = accessToken
    test.Items[0].refreshToken = refreshToken
    test.Items[0].is_active = true

    if (!test.Items[0].loginCount) {
      test.Items[0].loginCount = 1
    } else {
      test.Items[0].loginCount = test.Items[0].loginCount + 1
    }

    await userHelper.update(test.Items[0])
    test.Items[0].password = undefined
    const data: any = {}
    data.accessToken = accessToken
    data.refreshToken = refreshToken
    data.user = test.Items[0]
    return successResponse(
      res,
      globals.StatusOK,
      globalResponse.LoginSuccess,
      data,
    )
  } catch (error) {
    console.log(error)
    return errorResponse(
      res,
      globals.StatusInternalServerError,
      globalResponse.ServerError,
      null,
    )
  }
}

export const logout = async (req: any, res: any, next: any) => {
  const userId = req.user.pk
  try {
    const user: any = await userHelper.getUserById(userId)

    if (user.Items.length == 0) {
      return errorResponse(
        res,
        globals.StatusNotFound,
        globalResponse.UserNotFound,
        null,
      )
    } else if (user.Items[0].accessToken == null) {
      return errorResponse(
        res,
        globals.StatusBadRequest,
        globalResponse.AlreadyLoggedOut,
        null,
      )
    } else {
      user.Items[0].accessToken = null
      user.Items[0].refreshToken = null
      user.Items[0].is_active = false

      await userHelper.update(user.Items[0])
      return errorResponse(
        res,
        globals.StatusOK,
        globalResponse.LogoutSuccess,
        null,
      )
    }
  } catch (error) {
    console.log(error)
    return errorResponse(
      res,
      globals.StatusInternalServerError,
      globalResponse.ServerError,
      null,
    )
  }
}

export const generateOTP = async (req: any, res: any, next: any) => {
  const errors = validationResult(req)

  if (!errors.isEmpty()) {
    return errorResponse(
      res,
      globals.StatusBadRequest,
      errors.array()[0].msg,
      null,
    )
  }

  const country_code = req.body.country_code
  const number = req.body.phone_number
  try {
    const test = await userHelper.getUserByNumber(country_code, number)
    if (test.Items?.length !== 0) {
      return errorResponse(
        res,
        globals.StatusBadRequest,
        globalResponse.UserExist,
        null,
      )
    }
    const otp = await client.verify
      .services(process.env.serviceID as string)
      .verifications.create({
        to: `${country_code}${number}`,
        channel: req.body.channel,
      })

    if (otp.status == 'pending') {
      return successResponse(
        res,
        globals.StatusOK,
        globalResponse.OtpSent,
        null,
      )
    } else {
      return errorResponse(
        res,
        globals.StatusBadRequest,
        globalResponse.Error,
        null,
      )
    }
  } catch (error) {
    console.log(error)
    return errorResponse(
      res,
      globals.StatusInternalServerError,
      globalResponse.ServerError,
      null,
    )
  }
}

export const verifyOTP = async (req: any, res: any, next: any) => {
  const errors = validationResult(req)

  if (!errors.isEmpty()) {
    return errorResponse(
      res,
      globals.StatusBadRequest,
      errors.array()[0].msg,
      null,
    )
  }

  const country_code = req.body.country_code
  const number = req.body.phone_number
  const userId = req.user.pk

  try {
    const otp = await client.verify
      .services(process.env.serviceID as string)
      .verificationChecks.create({
        to: `${country_code}${number}`,
        code: req.body.otpValue,
      })
    if (otp.valid == true) {
      const user: any = await userHelper.getUserById(userId)
      if (user.Items.length !== 0) {
        user.Items[0].phone_number =
          country_code + number || user.Items[0].phone_number

        await userHelper.update(user.Items[0])
      } else {
        return errorResponse(
          res,
          globals.StatusNotFound,
          globalResponse.UserNotFound,
          null,
        )
      }
      return successResponse(
        res,
        globals.StatusOK,
        globalResponse.OtpVerified,
        null,
      )
    } else {
      return errorResponse(
        res,
        globals.StatusBadRequest,
        globalResponse.InvalidOTP,
        null,
      )
    }
  } catch (error) {
    console.log(error)
    return errorResponse(
      res,
      globals.StatusInternalServerError,
      globalResponse.ServerError,
      null,
    )
  }
}

export const refreshToken = async (req: any, res: any, next: any) => {
  const refreshToken = req.body.refreshToken
  if (!refreshToken) {
    return errorResponse(
      res,
      globals.StatusBadRequest,
      globalResponse.InvalidRefreshToken,
      null,
    )
  }
  jwt.verify(
    refreshToken,
    process.env.refSecret as string,
    async (err: any, user: any) => {
      if (!err) {
        const accessToken = jwt.sign(
          { user: user.user },
          process.env.secret as string,
          { expiresIn: process.env.jwtExpiration as string },
        )
        return successResponse(
          res,
          globals.StatusOK,
          globalResponse.RenewAccessToken,
          accessToken,
        )
      } else {
        return errorResponse(
          res,
          globals.StatusUnauthorized,
          globalResponse.Unauthorized,
          null,
        )
      }
    },
  )
}

export const resetPasswordLink = async (req: any, res: any, next: any) => {
  const errors = validationResult(req)

  if (!errors.isEmpty()) {
    return errorResponse(
      res,
      globals.StatusBadRequest,
      errors.array()[0].msg,
      null,
    )
  }

  try {
    crypto.randomBytes(32, async (err: any, buffer: any) => {
      if (err) {
        return errorResponse(
          res,
          globals.StatusBadRequest,
          globalResponse.Error,
          null,
        )
      }
      const token = buffer.toString('hex')
      const user: any = await userHelper.getUserByEmail(req.body.email)

      if (user.Items?.length == 0) {
        return errorResponse(
          res,
          globals.StatusNotFound,
          globalResponse.UserNotFound,
          null,
        )
      }
      user.Items[0].resetToken = token
      user.Items[0].resetTokenExpiration = Date.now() + 3600000
      await userHelper.update(user.Items[0])

      const link = await mailjet.post('send', { version: 'v3.1' }).request({
        Messages: [
          {
            From: {
              Email: 'vatsalp.tcs@gmail.com',
              Name: 'Vatsal',
            },
            To: [
              {
                Email: req.body.email,
              },
            ],
            Subject: 'Greetings from Insta-Cart.',
            HTMLPart: `
                                                                        <p>You requested to reset your password for our website</p>
                                                                        <p>Click on this <a href="https://cdgx035uzb.execute-api.ap-south-1.amazonaws.com/dev/auth/resetPassword/${token}">link</a> to reset a new password
                                                                        `,
            CustomID: 'AppGettingStartedTest',
          },
        ],
      })

      if (link) {
        return successResponse(
          res,
          globals.StatusOK,
          globalResponse.ResetPasswordLinkSent,
          null,
        )
      } else {
        return errorResponse(
          res,
          globals.StatusBadRequest,
          globalResponse.Error,
          null,
        )
      }
    })
  } catch (error) {
    console.log(error)
    return errorResponse(
      res,
      globals.StatusInternalServerError,
      globalResponse.ServerError,
      null,
    )
  }
}

export const getNewPassword = async (req: any, res: any, next: any) => {
  const token = req.params.token

  try {
    const user: any = await userHelper.getUserByToken(token)

    if (user.Items?.length == 0) {
      return errorResponse(
        res,
        globals.StatusNotAcceptable,
        globalResponse.InvalidResetLink,
        null,
      )
    }

    res.render('auth/new-password', {
      path: '/new-password',
      pageTitle: 'New Password',
      userId: user.pk,
      passwordToken: token,
    })
  } catch (error) {
    console.log(error)
    return errorResponse(
      res,
      globals.StatusInternalServerError,
      globalResponse.ServerError,
      null,
    )
  }
}

export const postNewPassword = async (req: any, res: any, next: any) => {
  const errors = validationResult(req)

  if (!errors.isEmpty()) {
    return errorResponse(
      res,
      globals.StatusBadRequest,
      errors.array()[0].msg,
      null,
    )
  }

  const newPassword = req.body.password
  const confirmPassword = req.body.confirmPassword
  const userId = req.body.userId
  const token = req.body.passwordToken
  let resetUser

  try {
    if (newPassword !== confirmPassword) {
      return errorResponse(
        res,
        globals.StatusBadRequest,
        globalResponse.DiffPasswords,
        null,
      )
    }

    const user: any = await userHelper.getUserByToken(token)

    if (user.Items.length == 0) {
      return errorResponse(
        res,
        globals.StatusBadRequest,
        globalResponse.InvalidResetLink,
        null,
      )
    }

    // resetUser = user
    const hashedPassword = await bcrypt.hash(newPassword, 10)

    user.Items[0].password = hashedPassword
    user.Items[0].resetToken = null
    user.Items[0].resetTokenExpiration = null

    await userHelper.update(user.Items[0])

    return successResponse(
      res,
      globals.StatusOK,
      globalResponse.PasswordChanged,
      null,
    )
  } catch (error) {
    console.log(error)
    return errorResponse(
      res,
      globals.StatusInternalServerError,
      globalResponse.ServerError,
      null,
    )
  }
}
