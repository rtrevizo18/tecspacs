import { ProgramError } from '../models/error.js';

export class ErrorHandler {
  static handle(error, context = '') {
    if (error instanceof ProgramError) {
      this.handleProgramError(error, context);
    } else {
      this.handleUnexpectedError(error, context);
    }
  }

  static handleProgramError(error, context) {
    console.error(`\n ${error.name}: ${error.message}`);

    if (error.details) {
      this.displayDetails(error.details);
    }

    if (context) {
      console.error(`Context: ${context}`);
    }

    // Provide helpful suggestions based on error type
    this.provideSuggestions(error);

    process.exit(1);
  }

  static handleUnexpectedError(error, context) {
    console.error('\nAn unexpected error occurred:');
    console.error(`   ${error.message}`);

    if (context) {
      console.error(`Context: ${context}`);
    }

    console.error(
      '\nThis might be a bug. Please report it with the following details:'
    );
    console.error(`   Error: ${error.name || 'Unknown'}`);
    console.error(`   Stack: ${error.stack}`);

    process.exit(1);
  }

  static displayDetails(details) {
    console.error('Details:');
    Object.entries(details).forEach(([key, value]) => {
      if (value !== null && value !== undefined) {
        console.error(`   ${key}: ${value}`);
      }
    });
  }

  static provideSuggestions(error) {
    const suggestions = {
      ValidationError: [
        '• Check your command arguments and options',
        '• Run with --help to see available options',
      ],
      FileSystemError: [
        '• Check if the file/directory exists',
        '• Verify you have the necessary permissions',
        '• Ensure the path is correct',
      ],
      NetworkError: [
        '• Check your internet connection',
        '• Verify the URL is accessible',
        "• Try again later if it's a temporary issue",
      ],
      ConfigurationError: [
        '• Check your configuration files',
        '• Run "tcspcs init" to reset configuration',
        '• Refer to the documentation for valid options',
      ],
    };

    const errorSuggestions = suggestions[error.name];
    if (errorSuggestions) {
      console.error('\nSuggestions:');
      errorSuggestions.forEach(suggestion => console.error(suggestion));
    }
  }

  static warn(message) {
    console.warn(`\nWarning: ${message}`);
  }

  static info(message) {
    console.log(`\n${message}`);
  }
}
