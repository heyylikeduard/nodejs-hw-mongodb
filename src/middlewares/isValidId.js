import { Types } from 'mongoose';
import httpErrors from 'http-errors';

const { BadRequest } = httpErrors;

export const isValidId = (req, res, next) => {
  const { contactId } = req.params;

  if (!Types.ObjectId.isValid(contactId)) {
    return next(new BadRequest('Invalid contact ID'));
  }

  next();
};
