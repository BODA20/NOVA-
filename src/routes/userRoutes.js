const express = require('express');
const userController = require('../controllers/userController');
const authMiddleware = require('../middlewares/authMiddleware');
const validate = require('../middlewares/validationMiddleware');
const {
  updateMeSchema,
  changeEmailSchema,
} = require('../middlewares/validators/userValidator');

const router = express.Router();

// Protect all routes after this middleware
router.use(authMiddleware.protect);

router.patch('/updateMe', validate(updateMeSchema), userController.updateMe);
router.delete('/deleteMe', userController.deleteMe);
router.post(
  '/requestChangeEmail',
  validate(changeEmailSchema),
  userController.requestChangeEmail,
);
router.get('/verifyNewEmail/:token', userController.verifyNewEmail);

// Admin only routes
router.use(authMiddleware.restrictTo('admin'));

router.route('/').get(userController.getAllUsers);

router
  .route('/:id')
  .get(userController.getUser)
  .patch(userController.updateUser)
  .delete(userController.deleteUser);

module.exports = router;
