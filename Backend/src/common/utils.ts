import dotenv from "dotenv";
var bcrypt =require("bcrypt");
var jwt = require("jsonwebtoken");

dotenv.config();

export class Util {

  static hashPassword(plainPassword: string): string {
    return bcrypt.hashSync(plainPassword, Number(process.env.BcryptHashRound));
  }

  static comparePassword(plainPassword: string, encryptedPassword: string): boolean {
    return bcrypt.compareSync(plainPassword, encryptedPassword);
  }

  static formatNumber(num: number | string | null): string {
    if (!num) return "";
    if (typeof num === "string") num = parseFloat(num);
    return num.toLocaleString("en-US");
  }

  static addDays(date: Date, days: number): Date {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
  }

  static padDigits(number: number, numDigits = 4): string {
    return number.toString().padStart(numDigits, "0");
  }

  static getChangePercentage(newValue: number | string, oldValue: number | string): string {
    newValue = parseFloat(newValue.toString());
    oldValue = parseFloat(oldValue.toString());

    if (oldValue === 0) return "N/A";
    const change = ((newValue - oldValue) / oldValue) * 100;
    let arrow = "";

    if (change > 0) arrow = "▲";
    else if (change < 0) arrow = "▼";
    else return `<span style="color:black;"> no change from </span>`;

    return `<span style="color: ${change > 0 ? "green" : "red"}">${change.toFixed(0)}% ${arrow}</span> from`;
  }

  static formatDateWithDayName(date: Date): string {
    return date.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
  }

  static generateToken(data: object, expiresIn: string = "1h"): string {
    return jwt.sign(data, process.env.JWT_SECRET as string, { expiresIn });
  }

  static addMinutes(date: Date, minutes: number): Date {
    return new Date(date.getTime() + minutes * 60000);
  }

  static getCharFromNumber(columnNumber: number): string {
    let dividend = columnNumber;
    let columnName = "";
    let modulo: number;

    while (dividend > 0) {
      modulo = (dividend - 1) % 26;
      columnName = String.fromCharCode(65 + modulo) + columnName;
      dividend = Math.floor((dividend - modulo) / 26);
    }

    return columnName;
  }

  static generateRefreshToken(user: object, expiresIn: string = "365d"): string {
    return jwt.sign(user, process.env.REFRESH_SECRET_TOKEN as string, { expiresIn });
  }

  static generateOtpCode(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }
}
