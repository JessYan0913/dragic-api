export class MailError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly retryable: boolean = false,
    public readonly provider?: string
  ) {
    super(message);
    this.name = 'MailError';
  }
}

export class MailConnectionError extends MailError {
  constructor(message: string, provider?: string) {
    super(message, 'MAIL_CONNECTION_ERROR', true, provider);
    this.name = 'MailConnectionError';
  }
}

export class MailAuthenticationError extends MailError {
  constructor(message: string, provider?: string) {
    super(message, 'MAIL_AUTH_ERROR', false, provider);
    this.name = 'MailAuthenticationError';
  }
}

export class MailRateLimitError extends MailError {
  constructor(message: string, provider?: string) {
    super(message, 'MAIL_RATE_LIMIT_ERROR', true, provider);
    this.name = 'MailRateLimitError';
  }
}

export class MailValidationError extends MailError {
  constructor(message: string) {
    super(message, 'MAIL_VALIDATION_ERROR', false);
    this.name = 'MailValidationError';
  }
}

export class MailTimeoutError extends MailError {
  constructor(message: string, provider?: string) {
    super(message, 'MAIL_TIMEOUT_ERROR', true, provider);
    this.name = 'MailTimeoutError';
  }
}
