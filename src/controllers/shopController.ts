import { validationResult } from 'express-validator/check'

import { globals, globalResponse } from '../util/const'
import { successResponse, errorResponse } from '../util/response'
import * as userHelper from '../helpers/userHelper'
import * as addressHelper from '../helpers/addressHelper'
import * as shopHelper from '../helpers/shopHelper'
import { generateId } from '../services/userId'
import bcrypt from 'bcryptjs'

import * as path from 'path'

export const getStores = async (req: any, res: any, next: any) => {
  try {
    const stores: any = await shopHelper.getStores()

    return successResponse(
      res,
      globals.StatusOK,
      globalResponse.StoresFetched,
      stores.Items,
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

export const getSingleStore = async (req: any, res: any, next: any) => {
  const storeId = req.params.storeId

  try {
    const categories: any = await shopHelper.getCategories(storeId)

    if (categories.Items?.length == 0) {
      return errorResponse(
        res,
        globals.StatusNotFound,
        'No Categories found!',
        null,
      )
    }
    for (let i = 0; i < categories.Items?.length; i++) {
      const items = await shopHelper.getItemsByCat(categories.Items[i].pk)
      if (items.Items?.length == 0) {
        categories.Items[i].items = null
      } else {
        categories.Items[i].items = items.Items
      }
    }
    const store: any = await shopHelper.getSingleStore(storeId)

    const data: any = {}
    data.store = store.Items[0]
    data.categories = categories.Items

    return successResponse(
      res,
      globals.StatusOK,
      globalResponse.SingleStoreFetched,
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

export const getItem = async (req: any, res: any, next: any) => {
  const itemId = req.params.itemId

  try {
    const data: any = await shopHelper.getItemById(itemId)

    if (data.Items.length == 0) {
      return errorResponse(res, globals.StatusNotFound, 'Item not Found!', null)
    }

    return successResponse(
      res,
      globals.StatusOK,
      globalResponse.ItemsFetched,
      data.Items[0],
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

export const search = async (req: any, res: any, next: any) => {
  const term = req.query.term

  try {
    const categories: any = await shopHelper.searchCategories(term)

    if (categories.Items?.length == 0) {
      return errorResponse(
        res,
        globals.StatusNotFound,
        'No Categories found!',
        null,
      )
    }
    for (let i = 0; i < categories.Items?.length; i++) {
      const items = await shopHelper.getItemsByCat(categories.Items[i].pk)
      if (items.Items?.length == 0) {
        categories.Items[i].items = null
      } else {
        categories.Items[i].items = items
      }
    }

    const items: any = await shopHelper.searchItems(term)

    const stores: any = await shopHelper.searchStores(term)

    const data: any = {}
    data.totalResults =
      categories.Items.length + items.Items.length + stores.Items.length
    data.categories = categories.Items
    data.stores = stores.Items
    data.items = items.Items

    return successResponse(
      res,
      globals.StatusOK,
      globalResponse.SearchResponse,
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
