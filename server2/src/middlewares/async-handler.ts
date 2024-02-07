import { NextFunction, Request, Response } from 'express';

// calling all controller function here and catching error if found
export const asyncHandler = (callback: Function) => (req: Request, res: Response, next: NextFunction) => {
  Promise.resolve(callback(req, res, next)).catch(next);
};
