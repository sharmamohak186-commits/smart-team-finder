const Joi = require('joi');

const registerSchema = Joi.object({
  name: Joi.string().min(2).max(60).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).max(100).required(),
});

const profileSchema = Joi.object({
  bio: Joi.string().allow('').max(300),
  experience: Joi.string().valid('beginner', 'intermediate', 'advanced').required(),
  skills: Joi.string().allow('').max(500),
});

const teamSchema = Joi.object({
  title: Joi.string().min(3).max(100).required(),
  description: Joi.string().allow('').max(1000),
  requiredSkills: Joi.string().min(1).max(500).required(),
});

module.exports = { registerSchema, profileSchema, teamSchema };
