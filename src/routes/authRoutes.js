const express = require('express');
const authController = require('../controllers/authController');
const validate = require('../middlewares/validationMiddleware');
const {
  signupSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
} = require('../middlewares/validators/userValidator');

const router = express.Router();

router.post('/signup', validate(signupSchema), authController.signup);
router.post('/login', validate(loginSchema), authController.login);
router.get('/logout', authController.logout);
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
