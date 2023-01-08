import { Response } from 'express';
import { errorMiddleWare } from '../middleware/error.middleware';
import { AppError, StatusCode } from './appError';

// distinguishing between trusted error or critical error
class ErrorHandler {
  private isTrustedError(error: AppError | Error): boolean {
    if (error instanceof AppError) {
      return error.isOperational;
    }
    return false;
  }

  public handleError(error: Error | AppError, res: Response): void {
    if (this.isTrustedError(error) && res) {
      console.log('error ocurred 2');
      this.handleTrustedError(error as AppError, res);
    } else {
      this.handleCriticalError(error, res);
    }
  }

  private handleTrustedError(error: AppError, response: Response): void {
    errorMiddleWare(error, response);
  }

  private handleCriticalError(_error: Error | AppError, response?: Response): void {
    if (response) {
      response.status(StatusCode.INTERNAL_SERVER_ERROR).json({ message: 'Internal server error' });
    }

    console.log('Application encountered a critical error. Exiting');
    process.exit(1);
  }
}

export const errorHandler = new ErrorHandler();
