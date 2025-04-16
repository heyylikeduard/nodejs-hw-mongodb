import Joi from 'joi';

export const validateBody = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body, { abortEarly: false });

    if (error) {
      const errors = error.details.map((detail) => detail.message);
      return res.status(400).json({
        status: 400,
        message: 'Validation errors',
        errors,
      });
    }

    next();
  };
};
