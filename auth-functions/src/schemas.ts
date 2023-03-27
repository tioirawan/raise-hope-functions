const Joi = require("joi");

export const volunteerRegistrationSchema = {
  name: Joi.string().required(),
  email: Joi.string().email().required(),
  phone: Joi.string().required(),
  address: Joi.string().required(),
  availability: Joi.array().items(Joi.number()).required(),
  preferedTime: Joi.array().items(Joi.string()).required(),
  interests: Joi.array().items(Joi.string()).required(),
};

export const institutionRegistrationSchema = {
  name: Joi.string().required(),
  email: Joi.string().email().required(),
  website: Joi.string(),
  phoneNumber: Joi.string().required(),
  country: Joi.string().required(),
  province: Joi.string().required(),
  city: Joi.string().required(),
  address: Joi.string().required(),
  postalCode: Joi.string().required(),
  organizationType: Joi.string().required(),
  organizationSize: Joi.string().required(),
  typeOfHelp: Joi.array().items(Joi.string()).required(),
};
