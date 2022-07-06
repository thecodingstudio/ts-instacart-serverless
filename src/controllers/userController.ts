import { validationResult } from 'express-validator/check'

import { globals, globalResponse } from '../util/const'
import { successResponse, errorResponse } from '../util/response'
import * as userHelper from '../helpers/userHelper'
import * as addressHelper from '../helpers/addressHelper'
import * as shopHelper from '../helpers/shopHelper'
import { generateId } from '../services/userId'
import bcrypt from 'bcryptjs'

import * as path from 'path'

export const getProfile = async (req: any, res: any, next: any) => {
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
    }

    const data = {
      email: user.Items[0].email,
      firstName: user.Items[0].firstName,
      lastName: user.Items[0].lastName,
      phone: user.Items[0].phone_number,
    }

    return successResponse(
      res,
      globals.StatusOK,
      globalResponse.UserFound,
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

export const editName = async (req: any, res: any, next: any) => {
  const userId = req.user.pk
  const firstName = req.body.firstName
  const lastName = req.body.lastName

  try {
    const user: any = await userHelper.getUserById(userId)

    if (user.Items.length == 0) {
      return errorResponse(
        res,
        globals.StatusNotFound,
        globalResponse.UserNotFound,
        null,
      )
    }

    user.Items[0].firstName = firstName || user.Items[0].firstName
    user.Items[0].lastName = lastName || user.Items[0].lastName

    await userHelper.update(user.Items[0])

    user.Items[0].password = undefined

    return successResponse(
      res,
      globals.StatusOK,
      globalResponse.UserUpdated,
      user.Items[0],
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

export const editEmail = async (req: any, res: any, next: any) => {
  const errors = validationResult(req)

  if (!errors.isEmpty()) {
    return errorResponse(
      res,
      globals.StatusBadRequest,
      errors.array()[0].msg,
      null,
    )
  }
  const userId = req.user.pk
  const email = req.body.email
  const password = req.body.password

  try {
    const test: any = await userHelper.getUserById(userId)
    const test1: any = await userHelper.getUserByEmail(email)

    if (test1.Items.length !== 0) {
      return errorResponse(
        res,
        globals.StatusBadRequest,
        globalResponse.EmailCheck,
        null,
      )
    }
    const passCheck = await bcrypt.compare(password, test.Items[0].password)

    if (!passCheck) {
      return errorResponse(
        res,
        globals.StatusBadRequest,
        globalResponse.InvalidCredentials,
        null,
      )
    }

    test.Items[0].email = email

    await userHelper.update(test.Items[0])

    test.Items[0].password = undefined

    return successResponse(
      res,
      globals.StatusOK,
      globalResponse.UserUpdated,
      test.Items[0],
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

export const postAddress = async (req: any, res: any, next: any) => {
  const payload = {
    pk: 'ADDR#' + generateId(6),
    address_info: req.body.address,
    address_type: req.body.address_type || 0,
    latitude: req.body.latitude,
    longitude: req.body.longitude,
    sk: req.user.pk,
    is_active: 1,
  }

  try {
    const address: any = await addressHelper.create(payload)

    return successResponse(
      res,
      globals.StatusOK,
      globalResponse.AddressAdded,
      address,
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

export const getAddresses = async (req: any, res: any, next: any) => {
  const userId = req.user.pk

  try {
    const addresses: any = await addressHelper.getAddressByUser(userId)

    const data: any = {}
    data.totalAddresses = addresses.Items?.length
    data.addresses = addresses.Items

    return successResponse(
      res,
      globals.StatusOK,
      globalResponse.AddressesFetched,
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

export const editAddress = async (req: any, res: any, next: any) => {
  const userId = req.user.pk
  const addressId = req.params.addressId

  try {
    const address: any = await addressHelper.getAddressByIdAndUser(
      addressId,
      userId,
    )

    if (address.Items?.length != 0) {
      address.Items[0].address_info =
        req.body.address_info || address.Items[0].address_info
      address.Items[0].icon = req.body.icon || address.Items[0].icon
      address.Items[0].address_type =
        req.body.address_type || address.Items[0].address_type
      address.Items[0].latitude = req.body.latitude || address.Items[0].latitude
      address.Items[0].longitude =
        req.body.longitude || address.Items[0].longitude
      try {
        await addressHelper.update(address.Items[0])

        return successResponse(
          res,
          globals.StatusOK,
          globalResponse.AddressUpdated,
          address.Items[0],
        )
      } catch (err) {
        console.log(err)
        return errorResponse(
          res,
          globals.StatusNotFound,
          globalResponse.Error,
          null,
        )
      }
    } else {
      return errorResponse(
        res,
        globals.StatusBadRequest,
        globalResponse.NoAddress,
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

export const deleteAddress = async (req: any, res: any, next: any) => {
  const addressId = req.body.addressId
  const userId = req.user.pk

  try {
    await userHelper.deleteItemById(addressId, userId)

    return successResponse(
      res,
      globals.StatusOK,
      globalResponse.AddressUpdated,
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

export const activateAddress = async (req: any, res: any, next: any) => {
  const userId = req.user.pk
  const addressId = 'ADDR#' + req.body.addressId
  try {
    const address: any = await addressHelper.getAddressByIdAndUser(
      addressId,
      userId,
    )

    if (address.Items[0].is_active == true) {
      return errorResponse(
        res,
        globals.StatusBadRequest,
        globalResponse.AddressAlreadyActive,
        null,
      )
    } else {
      address.Items[0].is_active = 1

      const otherAddresses: any = await addressHelper.getActiveAddresses(userId)
      if (otherAddresses.Items?.length !== 0) {
        for (let i = 0; i < otherAddresses.Items.length; i++) {
          otherAddresses.Items[i].is_active = false
          await addressHelper.update(otherAddresses.Items[i])
        }
      }
      const result = await addressHelper.update(address.Items[0])

      return successResponse(
        res,
        globals.StatusOK,
        globalResponse.AddressActivated,
        result,
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

export const postOrder = async (req: any, res: any, next: any) => {
  const userId = req.user.pk,
    items = req.body.items,
    order_type = req.body.order_type,
    delivery_time = req.body.delivery_time,
    amount = req.body.amount,
    discount_amount = req.body.discount_amount,
    addressId = req.body.addressId,
    country_code = req.body.country_code,
    phone_number = req.body.phone_number,
    instructions = req.body.instructions,
    is_gift = req.body.is_gift
  const net_amount = amount - discount_amount

  try {
    const payload = {
      pk: 'ORD#' + generateId(6),
      sk: userId,
      order_type: order_type,
      delivery_time: delivery_time,
      country_code: country_code,
      phone_number: phone_number,
      instructions: instructions,
      is_gift: is_gift,
      addressId: addressId,
      amount: amount,
      discount_amount: discount_amount,
      net_amount: net_amount,
      status: 0,
    }

    const ord: any = await userHelper.create(payload)

    for (let j = 0; j < items.length; j++) {
      if (items[j]) {
        await userHelper.create({
          pk: 'OITEM#' + generateId(6),
          sk: payload.pk,
          itemId: items[j].id,
          quantity: items[j].qty,
          itemTotal: items[j].qty * items[j].price,
        })
      }
    }
    // const resp = await order.findByPk(ord.id, {
    //   include: { model: orderItem, include: [item] },
    // });

    return successResponse(
      res,
      globals.StatusOK,
      globalResponse.OrderPlaced,
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

export const getOrders = async (req: any, res: any, next: any) => {
  const userId = req.user.pk

  try {
    const orders: any = await userHelper.getOrderByUser(userId)

    for (let i = 0; i < orders.Items?.length; i++) {
      let temp = []
      const ordItems: any = await userHelper.getOrderitemsByOrder(
        orders.Items[i].pk,
      )

      for (let j = 0; j < ordItems.Items?.length; j++) {
        const orderItems: any = await shopHelper.getItemById(
          ordItems.Items[j].itemId,
        )
        if (orderItems.Items?.length == 0) {
          temp.push(null)
        } else {
          temp.push(orderItems.Items[0])
        }
      }
      orders.Items[i].items = temp
    }

    return successResponse(
      res,
      globals.StatusOK,
      globalResponse.OrdersFetched,
      orders.Items,
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
