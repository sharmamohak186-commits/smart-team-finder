// Validates req.body with a Joi schema. On failure, re-renders the form with the error.
module.exports = (schema, view) => (req, res, next) => {
  const { error, value } = schema.validate(req.body, { stripUnknown: true });
  if (error) {
    return res.status(400).render(view, { error: error.details[0].message, form: req.body });
  }
  req.body = value;
  next();
};
