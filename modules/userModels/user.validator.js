const Joi = require('joi');

const passwordRule = Joi.string().min(8).max(128);

exports.signupSchema = Joi.object({
  name: Joi.string().trim().min(2).max(50).required(),
  email: Joi.string().trim().lowercase().email().required(),
  password: passwordRule.required(),
  passwordConfirm: Joi.any()
    .valid(Joi.ref('password'))
    .required()
    .messages({ 'any.only': 'Passwords are not the same!' }),
}).required();

exports.loginSchema = Joi.object({
  email: Joi.string().trim().lowercase().email().required(),
  password: passwordRule.required(),
}).required();

exports.forgotPasswordSchema = Joi.object({
  email: Joi.string().trim().lowercase().email().required(),
}).required();

exports.resetPasswordSchema = Joi.object({
  password: passwordRule.required(),
  passwordConfirm: Joi.any()
    .valid(Joi.ref('password'))
    .required()
    .messages({ 'any.only': 'Passwords are not the same!' }),
}).required();

exports.updateMeSchema = Joi.object({
  name: Joi.string().trim().min(2).max(50),
  email: Joi.string().trim().lowercase().email(),
  photo: Joi.string().trim(),
})
  .min(1)
  .required();

exports.changeEmailSchema = Joi.object({
  newEmail: Joi.string().trim().lowercase().email().required(),
}).required();
