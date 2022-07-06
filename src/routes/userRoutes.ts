import * as userController from '../controllers/userController'
import * as stripeController from '../controllers/stripeController'
import * as jwtAuth from '../middlewares/jwtAuth'
import express from 'express'
import cors from 'cors'
import { body } from 'express-validator/check'

const router = express.Router()
router.use(cors())

router.get('/profile', jwtAuth.jwtAuth, userController.getProfile)

router.put('/edit-name', jwtAuth.jwtAuth, userController.editName)

router.put(
  '/edit-email',
  body('email')
    .isEmail()
    .withMessage('Please enter a valid email address!')
    .normalizeEmail(),
  body('password', 'Please Enter a valid Password!')
    .isLength({ min: 5 })
    .trim(),
  jwtAuth.jwtAuth,
  userController.editEmail,
)

router.get('/get-addresses', jwtAuth.jwtAuth, userController.getAddresses)
router.post('/add-address', jwtAuth.jwtAuth, userController.postAddress)
router.put(
  '/edit-address/:addressId',
  jwtAuth.jwtAuth,
  userController.editAddress,
)

router.post(
  '/activate-address',
  jwtAuth.jwtAuth,
  userController.activateAddress,
)
router.delete('/delete-address', jwtAuth.jwtAuth, userController.deleteAddress)

router.post('/add-card', jwtAuth.jwtAuth, stripeController.addCard)

router.get('/get-cards', jwtAuth.jwtAuth, stripeController.getCards)

router.post('/post-order', jwtAuth.jwtAuth, userController.postOrder)

router.get('/get-orders', jwtAuth.jwtAuth, userController.getOrders)

router.post('/checkout', jwtAuth.jwtAuth, stripeController.checkout)

export default router
