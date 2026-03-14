// const AuthOtpQuery = require('../usecases/otps/auth-otp.usecase.queries');
// const AuthOtpCommand = require('../usecases/otps/auth-otp.usecase.commands');
import { Request, Response } from 'express';
import { Util } from '../common/utils';
const jwt = require('jsonwebtoken');
require('dotenv').config();

import {AuthCommand} from '../usecases/auth/auth-usecase-commands';

export class AuthController {

  static async login(req:Request, res:Response) {
    const payload = req.body;
    const user = await AuthCommand.login(payload);
    return res.status(200).json(user);
  }
  // static async forgotPassword(req:Request, res:Response) {
  //   const payload = req.body;
  //   const user = await AuthCommand.forgotPassword(payload);
  //   return res.status(200).json(user);
  // }
  // static async resetPassword(req:Request, res:Response) {
  //   const payload = req.body;
  //   const user = await AuthCommand.resetPassword(payload);
  //   return res.status(200).json(user);
  // }
  // static async logout(req, res) {
  //   const payload = req.body;
  //   const user = await AuthCommand.logout(payload);
  //   return res.status(200).json(user);
  // }
  static async refreshToken(req:Request, res:Response) {
    try {
      const refreshTokenSecret = process.env.REFRESH_SECRET_TOKEN;
      const refreshToken = req.headers['x-refresh-token'];
      if (!refreshToken) {
        res.status(401).send();
        return;
      }
      const payload = jwt.verify(refreshToken, refreshTokenSecret);
      const p = {
        userId: payload.userId,
        email: payload.email ? payload.email : '',
        firstName: payload?.firstName ? payload?.firstName:'',
        lastName: payload.lastName ? payload.lastName : '' ,
        middleName: payload.middleName ? payload.middleName : '',
      //   gender: account.gender,
      //   profile_picture: account.profilepicture,
        phone: payload.phone ? payload.phone : '',
        role: payload.role,
      //   job_title: account.job_title,
      }

      const token = Util.generateToken(p, '1h');
      res.status(200).send({ token });
    } catch (error:any) {
      console.log(error);
      res.status(403).send(error.message);
    }
  }
  static async requestPasswordReset(req:Request, res:Response) {
    const payload = req.body;
    const user = await AuthCommand.requestPasswordReset(payload);
    return res.status(200).json(user);
  }
  static async verifyPasswordResetCode(req:Request, res:Response) {
    const payload = req.body;
    const user = await AuthCommand.verifyPasswordResetCode(payload);
    return res.status(200).json(user);
  }
  static async resetPassword(req:Request, res:Response) {
    const payload = req.body;
    const user = await AuthCommand.resetPassword(payload);
    return res.status(200).json(user);
  }
}

