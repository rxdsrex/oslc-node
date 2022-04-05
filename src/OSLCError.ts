class OSLCError extends Error {
  /** The error code (Can be standard HTTP error codes) */
  code?: Number;

  /** The stack trace of the error */
  stack?: string;

  /**
   * Constructs OSLCError object.
   *
   * @param message - The error message
   * @param errorCode - The error code (Can be standard HTTP error codes)
   * @param errStack - The stack trace of the error
   */
  constructor(message: string, errorCode?: Number, errStack?: string) {
    super(message);
    this.name = 'OSLCError';
    this.code = errorCode || 500;
    this.stack = errStack;
    // Set the prototype explicitly.
    Object.setPrototypeOf(this, OSLCError.prototype);
  }

  /**
   * Returns error description corresponding the error code.
   */
  getErrorType() {
    const { code: errorCode } = this;
    if (errorCode === undefined) {
      return 'Error code not defined';
    }
    if (errorCode === 500) {
      return `${errorCode} : Internal Server Error`;
    }
    if (errorCode === 401) {
      return `${errorCode} : Unauthorized`;
    }
    if (errorCode === 403) {
      return `${errorCode} : Forbidden`;
    }
    return `${errorCode}`;
  }
}

export default OSLCError;
