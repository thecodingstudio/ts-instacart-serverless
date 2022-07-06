import Stripe from 'stripe'

import { globals, globalResponse } from '../util/const'
import { successResponse, errorResponse } from '../util/response'
import * as userHelper from '../helpers/userHelper'
import * as stripeHelper from '../helpers/stripeHelper'
import { generateId } from '../services/userId'

const stripe = new Stripe(process.env.STRIPE_SK as string, {
  apiVersion: '2020-08-27',
})

export const addCard = async (req: any, res: any, next: any) => {
  try {
    const user: any = await userHelper.getUserById(req.user.pk)

    const exp = req.body.expire.split('/')

    const exp_month = exp[0]
    const exp_year = exp[1]

    const cardInfo = await stripe.customers.createSource(
      user.Items[0].stripe_id,
      {
        source: {
          object: 'card',
          number: req.body.number,
          exp_month: exp_month,
          exp_year: exp_year,
          cvc: req.body.cvc,
          name: req.body.name,
        } as any,
      },
    )

    const payload = {
      pk: 'CARD#' + generateId(6),
      sk: req.user.pk,
      card_id: cardInfo.id,
    }

    const save = await stripeHelper.create(payload)

    return successResponse(
      res,
      globals.StatusOK,
      globalResponse.CardSaved,
      save,
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

export const getCards = async (req: any, res: any, next: any) => {
  try {
    const user: any = await userHelper.getUserById(req.user.pk)

    const cards = await stripe.customers.listSources(user.Items[0].stripe_id, {
      object: 'card',
    })

    return successResponse(
      res,
      globals.StatusOK,
      globalResponse.CardsFetched,
      cards,
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

export const checkout = async (req: any, res: any, next: any) => {
  try {
    const user: any = await userHelper.getUserById(req.user.pk)

    const amount = req.body.amount

    if (!user.Items[0].stripe_id) {
      return errorResponse(
        res,
        globals.StatusBadRequest,
        globalResponse.StripeError,
        null,
      )
    }

    const cardInfo = await stripe.customers.retrieveSource(
      user.Items[0].stripe_id,
      req.body.card_id,
    )

    const intent = await stripe.paymentIntents.create({
      payment_method_types: ['card'],
      description: 'Pay for Insta-Cart',
      receipt_email: user.Items[0].email,
      amount: parseFloat(amount) * 100,
      currency: 'usd',
      customer: user.Items[0].stripe_id,
      payment_method: cardInfo.id,
    })

    const paym = await userHelper.create({
      pk: 'PAYM#' + generateId(6),
      amount: parseFloat(amount),
      sk: req.user.pk,
      transaction_id: intent.client_secret,
      status: 'PENDING',
    })

    const data: any = {}
    data.client_secret = intent.client_secret
    data.customerId = intent.customer

    return successResponse(
      res,
      globals.StatusOK,
      globalResponse.PaymentIntentCreated,
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
