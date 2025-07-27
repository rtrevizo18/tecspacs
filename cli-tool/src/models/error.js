export class ProgramError extends Error {
  constructor(message, code = 'GENERIC_ERROR', details = null) {
    super(message);
    this.name = 'ProgramError';
    this.code = code;
    this.details = details;
    this.timestamp = new Date().toISOString();
  }

  toJSON() {
    return {
      name: this.name,
      message: this.message,
      code: this.code,
      details: this.details,
      timestamp: this.timestamp,
    };
  }
}

// Specific error types
export class ValidationError extends ProgramError {
  constructor(message, field = null) {
    super(message, 'VALIDATION_ERROR', { field });
    this.name = 'ValidationError';
  }
}

export class FileSystemError extends ProgramError {
  constructor(message, path = null) {
    super(message, 'FILESYSTEM_ERROR', { path });
    this.name = 'FileSystemError';
  }
}

export class NetworkError extends ProgramError {
  constructor(message, url = null, statusCode = null) {
    super(message, 'NETWORK_ERROR', { url, statusCode });
    this.name = 'NetworkError';
  }
}

export class ConfigurationError extends ProgramError {
  constructor(message, configKey = null) {
    super(message, 'CONFIGURATION_ERROR', { configKey });
    this.name = 'ConfigurationError';
  }
}
