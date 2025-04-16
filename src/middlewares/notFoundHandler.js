import httpErrors from 'http-errors';
const { NotFound } = httpErrors;

export const notFoundHandler = (req, res, next) => {
  next(NotFound('Route not found'));
};
