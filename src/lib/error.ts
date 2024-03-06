export class AppError extends Error {
  type: string;

  displayMessage: string;

  constructor(type: string, message: string, displayMessage: string) {
    super(message);
    this.type = type;
    this.displayMessage = displayMessage;
  }
}

export const ERROR_TYPE_APP_STATE = 'AppStateError';
