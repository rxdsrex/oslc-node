class OSLCError extends Error {
  errorCode?: Number;

  constructor(message: string, errorCode?: Number) {
    super(message);
    this.name = 'OSLCError';
    this.errorCode = errorCode;
    // Set the prototype explicitly.
    Object.setPrototypeOf(this, OSLCError.prototype);
  }

  getErrorType() {
    const { errorCode } = this;
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
