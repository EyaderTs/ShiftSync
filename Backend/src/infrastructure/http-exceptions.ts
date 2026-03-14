export class HttpException extends Error {
    public statusCode: number;
    public status: string;
    public isOperational: boolean;
    public error: string;
  
    constructor(message: string, statusCode: number, name: string, error: string) {
      super(message);
      this.statusCode = statusCode;
      this.status = "fail";
      this.isOperational = true;
      this.name = name;
      this.error = error;
      Error.captureStackTrace(this, this.constructor);
    }
  }
  
  export class NotFoundException extends HttpException {
    constructor(message: string = "Resource not found") {
      super(message, 404, "NotFound", "Not Found");
    }
  }
  
  export class BadRequestException extends HttpException {
    constructor(message: string = "Invalid request data") {
      super(message, 400, "BadRequest", "Bad Request");
    }
  }
  
  export class ForbiddenException extends HttpException {
    constructor(message: string = "Access forbidden") {
      super(message, 403, "Forbidden", "Forbidden");
    }
  }
  
  export class UnAuthorizedException extends HttpException {
    constructor(message: string = "Unauthorized access") {
      super(message, 401, "UnAuthorized", "Unauthorized");
    }
  }
  