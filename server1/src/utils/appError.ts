export const StatusCode = {
  OK: 200,
  CREATED: 201,
  ACCEPTED: 202,
  NO_CONTENT: 204,
  PARTIAL_CONTENT: 206,
  MULTIPLE_CHOICES: 300,
  SEE_OTHER: 303,
  NOT_MODIFIED: 304,
  TEMPORARY_REDIRECT: 307,
  PERMANENT_REDIRECT: 308,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  METHOD_NOT_ALLOWED: 405,
  NOT_ACCEPTABLE: 406,
  GONE: 410,
  REQUEST_URI_TOO_LONG: 414,
  INTERNAL_SERVER_ERROR: 500,
  NOT_IMPLEMENTED: 501,
} as const;

type keys = keyof typeof StatusCode;

type StatusCodeType = typeof StatusCode[keys]; // get values

interface AppErrorArgs {
  name?: string;
  statusCode: StatusCodeType;
  message: string;
  isOperational?: boolean; //The isOperational property is what determines if this error is a serious mistake. Setting it to true means that the error is normal and the user should receive an explanation what caused it. setting it to false means its a critical error
}

export class AppError extends Error {
  public statusCode: StatusCodeType;
  public name: string;
  public isOperational: boolean = true;

  constructor(args: AppErrorArgs) {
    super(args.message);
    Object.setPrototypeOf(this, new.target.prototype);

    this.statusCode = args.statusCode;
    this.name = args.name || 'Error';
    if (args.isOperational !== undefined) {
      this.isOperational = args.isOperational;
    }
    // Set the prototype explicitly.
    Error.captureStackTrace(this, this.constructor);
  }
}
