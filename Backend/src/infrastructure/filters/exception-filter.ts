import { Request, Response, NextFunction } from 'express';

interface CustomError extends Error {
  statusCode?: number;
}

const exceptionFilter = (
  err: CustomError,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const statusCode = err.statusCode || 500;

  if (process.env.NODE_ENV !== 'production') {
    console.log(err);
  }

  let errorMessage = err.message;
  if (process.env.NODE_ENV === 'production' && statusCode === 500) {
    console.log(err);
    errorMessage = 'Internal Server Error';
  }

  const response = {
    statusCode,
    timestamp: new Date(),
    path: req.url,
    message: errorMessage,
    error: err.message || 'Internal Server Error',
  };

  res.status(statusCode).json(response);
  next();
};

export default exceptionFilter;