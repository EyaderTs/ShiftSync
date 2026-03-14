const jwt = require('jsonwebtoken');
require('dotenv').config();
import { NextFunction, Request,Response } from "express";
const jwtSecret = process.env.JWT_SECRET;
const Authenticate = async (req:Request, res:Response, next:NextFunction) => {
  //Get the jwt token from the head
  const tokenHeader = req.headers['authorization'];
  if (!tokenHeader) {
    res.status(401).send({ message: 'Unauthorized' });
    return;
  }
  const arr = tokenHeader.split(' ');
  if (arr.length < 2) {
    res.status(401).send({ message: 'Unauthorized' });
    return;
  }
  const token = arr[arr.length - 1];
  let jwtPayload;
  if (!token) {
    res.status(401).send({ message: 'Unauthorized' });
    return;
  }
  try {
    jwtPayload = jwt.verify(token, jwtSecret);
    (req as any).currentUser = jwtPayload;
  } catch (error) {
    res.status(401).send({ message: 'Unauthorized' });
    return;
  }
  next();
};
export default Authenticate;
