/**
 * @fileoverview Comprehensive error handling utilities for the GitHub MCP Server
 * Ensures the server never crashes and provides meaningful error responses
 */

/**
 * Error types for categorizing different kinds of errors
 */
const ErrorTypes = {
  VALIDATION: 'VALIDATION',
  AUTHENTICATION: 'AUTHENTICATION',
  AUTHORIZATION: 'AUTHORIZATION',
  API_ERROR: 'API_ERROR',
  NETWORK_ERROR: 'NETWORK_ERROR',
  RATE_LIMIT: 'RATE_LIMIT',
  NOT_FOUND: 'NOT_FOUND',
  INTERNAL: 'INTERNAL',
  CONFIGURATION: 'CONFIGURATION'
};

/**
 * Enhanced error class with additional context
 */
class MCPError extends Error {
  constructor(message, type = ErrorTypes.INTERNAL, originalError = null, context = {}) {
    super(message);
    this.name = 'MCPError';
    this.type = type;
    this.originalError = originalError;
    this.context = context;
    this.timestamp = new Date().toISOString();
    
    // Capture stack trace
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, MCPError);
    }
  }
}

/**
 * Safe wrapper for async functions that ensures no unhandled errors
 * @param {Function} fn - The async function to wrap
 * @param {string} operationName - Name of the operation for logging
 * @returns {Function} - Wrapped function that never throws
 */
function safeAsync(fn, operationName = 'unknown operation') {
  return async (...args) => {
    try {
      return await fn(...args);
    } catch (error) {
      return handleError(error, operationName, args);
    }
  };
}

/**
 * Safe wrapper for sync functions
 * @param {Function} fn - The function to wrap
 * @param {string} operationName - Name of the operation for logging
 * @returns {Function} - Wrapped function that never throws
 */
function safeSync(fn, operationName = 'unknown operation') {
  return (...args) => {
    try {
      return fn(...args);
    } catch (error) {
      return handleError(error, operationName, args);
    }
  };
}

/**
 * Categorizes error based on error message and properties
 * @param {Error} error - The error to categorize
 * @returns {string} - Error type
 */
function categorizeError(error) {
  if (!error) return ErrorTypes.INTERNAL;
  
  const message = error.message?.toLowerCase() || '';
  const status = error.status || error.statusCode;
  
  // Network/Connection errors
  if (message.includes('network') || message.includes('timeout') || 
      message.includes('econnreset') || message.includes('enotfound') ||
      error.code === 'ECONNRESET' || error.code === 'ENOTFOUND') {
    return ErrorTypes.NETWORK_ERROR;
  }
  
  // Rate limiting
  if (status === 429 || message.includes('rate limit') || message.includes('api rate limit exceeded')) {
    return ErrorTypes.RATE_LIMIT;
  }
  
  // Authentication
  if (status === 401 || message.includes('unauthorized') || message.includes('authentication') ||
      message.includes('bad credentials')) {
    return ErrorTypes.AUTHENTICATION;
  }
  
  // Authorization  
  if (status === 403 || message.includes('forbidden') || message.includes('permission') ||
      message.includes('not allowed')) {
    return ErrorTypes.AUTHORIZATION;
  }
  
  // Not found
  if (status === 404 || message.includes('not found') || message.includes('does not exist')) {
    return ErrorTypes.NOT_FOUND;
  }
  
  // Validation errors
  if (message.includes('required') || message.includes('invalid') || 
      message.includes('missing') || message.includes('validation') ||
      status === 400 || status === 422) {
    return ErrorTypes.VALIDATION;
  }
  
  // API errors (general GitHub API errors)
  if (status >= 400 && status < 500) {
    return ErrorTypes.API_ERROR;
  }
  
  // Server errors
  if (status >= 500) {
    return ErrorTypes.API_ERROR;
  }
  
  return ErrorTypes.INTERNAL;
}

/**
 * Creates user-friendly error message based on error type
 * @param {Error} error - The original error
 * @param {string} type - Error type
 * @param {string} operation - Operation that failed
 * @returns {string} - User-friendly error message
 */
function createUserFriendlyMessage(error, type, operation) {
  const baseMessage = error.message || 'An unknown error occurred';
  
  switch (type) {
    case ErrorTypes.AUTHENTICATION:
      return `Authentication failed. Please check your GitHub token. Original error: ${baseMessage}`;
      
    case ErrorTypes.AUTHORIZATION:
      return `Access denied. You don't have permission to perform this operation. Original error: ${baseMessage}`;
      
    case ErrorTypes.RATE_LIMIT:
      return `GitHub API rate limit exceeded. Please wait before making more requests. Original error: ${baseMessage}`;
      
    case ErrorTypes.NOT_FOUND:
      return `The requested resource was not found. Please check the repository/resource name. Original error: ${baseMessage}`;
      
    case ErrorTypes.VALIDATION:
      return `Invalid input provided. ${baseMessage}`;
      
    case ErrorTypes.NETWORK_ERROR:
      return `Network error occurred while connecting to GitHub. Please check your internet connection. Original error: ${baseMessage}`;
      
    case ErrorTypes.API_ERROR:
      return `GitHub API error occurred during ${operation}. ${baseMessage}`;
      
    case ErrorTypes.CONFIGURATION:
      return `Configuration error: ${baseMessage}`;
      
    case ErrorTypes.INTERNAL:
    default:
      return `Internal error occurred during ${operation}. ${baseMessage}`;
  }
}

/**
 * Main error handling function
 * @param {Error} error - The error to handle
 * @param {string} operation - Name of the operation that failed
 * @param {any} context - Additional context (arguments, etc.)
 * @returns {object} - Standardized error response
 */
function handleError(error, operation = 'unknown operation', context = null) {
  // Ensure we have an error object
  if (!error) {
    error = new Error('Unknown error occurred');
  }
  
  // If error is already an MCPError, don't wrap it again
  if (error instanceof MCPError) {
    return formatErrorResponse(error, operation);
  }
  
  // Categorize the error
  const errorType = categorizeError(error);
  
  // Create enhanced error
  const mcpError = new MCPError(
    error.message || 'Unknown error',
    errorType,
    error,
    { operation, context, originalStack: error.stack }
  );
  
  return formatErrorResponse(mcpError, operation);
}

/**
 * Formats error into standardized MCP response
 * @param {MCPError} mcpError - The MCP error object
 * @param {string} operation - Operation name
 * @returns {object} - Formatted error response
 */
function formatErrorResponse(mcpError, operation) {
  const userMessage = createUserFriendlyMessage(mcpError, mcpError.type, operation);
  
  // Log error for debugging (but don't interfere with MCP protocol)
  const logMessage = `[${mcpError.type}] Error in ${operation}: ${mcpError.message}`;
  if (mcpError.originalError?.stack) {
    // Use stderr to avoid interfering with MCP protocol
    process.stderr.write(`${logMessage}\nStack: ${mcpError.originalError.stack}\n`);
  } else {
    process.stderr.write(`${logMessage}\n`);
  }
  
  return {
    success: false,
    message: userMessage,
    error: mcpError.message,
    errorType: mcpError.type,
    timestamp: mcpError.timestamp
  };
}

/**
 * Validates required parameters
 * @param {object} params - Parameters to validate
 * @param {string[]} required - Required parameter names
 * @param {string} operation - Operation name for error context
 * @throws {MCPError} - If validation fails
 */
function validateRequired(params, required, operation = 'operation') {
  if (!params || typeof params !== 'object') {
    throw new MCPError(
      'Parameters object is required',
      ErrorTypes.VALIDATION,
      null,
      { operation, required }
    );
  }
  
  const missing = required.filter(param => {
    const value = params[param];
    return value === undefined || value === null || value === '';
  });
  
  if (missing.length > 0) {
    throw new MCPError(
      `Missing required parameters: ${missing.join(', ')}`,
      ErrorTypes.VALIDATION,
      null,
      { operation, required, missing, provided: Object.keys(params) }
    );
  }
}

/**
 * Safely parses JSON with error handling
 * @param {string} jsonString - JSON string to parse
 * @param {string} operation - Operation context
 * @returns {object} - Parsed object or error response
 */
function safeJsonParse(jsonString, operation = 'JSON parsing') {
  try {
    return JSON.parse(jsonString);
  } catch (error) {
    return handleError(
      new Error(`Invalid JSON: ${error.message}`),
      operation,
      { jsonString: jsonString?.substring(0, 100) + '...' }
    );
  }
}

/**
 * Wraps handler functions to ensure they never crash the server
 * @param {Function} handler - Handler function to wrap
 * @param {string} handlerName - Name of the handler
 * @returns {Function} - Safe wrapped handler
 */
function wrapHandler(handler, handlerName) {
  return async (...args) => {
    try {
      // Validate handler is a function
      if (typeof handler !== 'function') {
        throw new MCPError(
          `Handler ${handlerName} is not a function`,
          ErrorTypes.INTERNAL,
          null,
          { handlerName, handlerType: typeof handler }
        );
      }
      
      const result = await handler(...args);
      
      // Ensure result is in expected format
      if (result && typeof result === 'object') {
        return result;
      }
      
      // If result is not in expected format, wrap it
      return {
        success: true,
        data: result,
        message: `${handlerName} completed successfully`
      };
      
    } catch (error) {
      return handleError(error, handlerName, { args });
    }
  };
}

module.exports = {
  ErrorTypes,
  MCPError,
  safeAsync,
  safeSync,
  handleError,
  validateRequired,
  safeJsonParse,
  wrapHandler,
  formatErrorResponse,
  categorizeError
};