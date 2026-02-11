const express = require('express');
const authController = require('./authController');
const router = express.Router();
const { validate } = require('../../common/middelWare/userMiddlewares');
const {
  signupSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
} = require('./user.validator');
router.post('/signup', validate(signupSchema), authController.signup);
router.post('/login', validate(loginSchema), authController.login);
router.get('/verifyEmail/:token', authController.verifyEmail);

router.post(
  '/forgotPassword',
  validate(forgotPasswordSchema),
  authController.forgotPassword,
);

router.patch(
  '/resetPassword/:token',
  validate(resetPasswordSchema),
  authController.resetPassword,
);

module.exports = router;
