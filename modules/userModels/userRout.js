const express = require('express');
const { updateMeSchema } = require('./user.validator');
const router = express.Router();
const userController = require('./userController');
const { changeEmailSchema } = require('./user.validator');
const { validate } = require('../../common/middelWare/userMiddlewares');
const MiddleWare = require('./../../common/middelWare/userMiddlewares');

router.post(
  '/resetData',
  MiddleWare.protect,
  validate(updateMeSchema),
  userController.resetData,
);

router.patch(
  '/changeEmail',
  MiddleWare.protect,
  validate(changeEmailSchema),
  userController.requestChangeEmail,
);

router.get('/verifyNewEmail/:token', userController.verifyNewEmail);

router.delete('/deleteMe', MiddleWare.protect, userController.deleteUser);

module.exports = router;
