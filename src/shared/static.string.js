class StaticStrings {
  //Other
  static INFO_RESPONSE_STATUS_SUCCESS = "success";
  static ERR_RESPONSE_STATUS_FAIL = "fail";
  static ERR_INTERNAL_SERVER_ERROR = "Internal Server Error!";
  static ERR_RECORDS_NOT_FOUND = "Records Not Found!";
  static ERR_INVALID_TOKEN = "Invalid token!";
  static ERR_INVALID_INPUT = "Invalid input provided!";
  static ERR_UNAUTHORIZED = "Unauthorized access!";
  static ERR_FORBIDDEN = "Forbidden access!";
  static INFO_RESOURCE_CREATED = "Resource created successfully.";
  static INFO_RESOURCE_UPDATED = "Resource updated successfully.";
  static INFO_RESOURCE_DELETED = "Resource deleted successfully.";
  static ERR_RESOURCE_NOT_FOUND = "Resource not found.";
  static ERR_DUPLICATE_RECORD = "Duplicate record found.";
  static ERR_MISSING_PARAMETERS = "Missing required parameters.";
  static ERR_OPERATION_NOT_PERMITTED = "Operation not permitted.";
  static ERR_INVALID_REQUEST = "Invalid request.";
  static ERR_EMAIL_ALREADY_REGISTERED = "Email is already registered.";
  static ERR_USERNAME_ALREADY_TAKEN = "Username is already taken.";
  static ERR_LOGIN_FAILED = "Login failed. Invalid credentials.";
  static INFO_LOGOUT_SUCCESSFUL = "Logout successful.";
  static INFO_PASSWORD_RESET_LINK_SENT =
    "Password reset link has been sent to your email.";
  static INFO_PASSWORD_RESET_SUCCESSFUL = "Password reset successful.";
  static ERR_INVALID_RESET_TOKEN = "Invalid or expired reset token.";
  static ERR_RESOURCE_ALREADY_EXISTS = "Resource already exists.";

  // Token related messages
  static ERR_EXPIRED_TOKEN = "Token has expired!";
  static ERR_MISSING_TOKEN = "Missing token!";
  static ERR_TOKEN_NOT_PROVIDED = "Token not provided in headers!";
  static ERR_TOKEN_REVOKED = "Token has been revoked!";

  // API input related messages
  static ERR_INVALID_EMAIL = "Invalid email address!";
  // HTTP status messages
  static HTTP_STATUS_OK = "OK";
  static HTTP_STATUS_CREATED = "Created";
  static HTTP_STATUS_BAD_REQUEST = "Bad Request";
  static HTTP_STATUS_UNAUTHORIZED = "Unauthorized";
  static HTTP_STATUS_FORBIDDEN = "Forbidden";
  static HTTP_STATUS_NOT_FOUND = "Not Found";
  static HTTP_STATUS_CONFLICT = "Conflict";
  static HTTP_STATUS_INTERNAL_SERVER_ERROR = "Internal Server Error";
  static HTTP_STATUS_SERVICE_UNAVAILABLE = "Service Unavailable";
}

module.exports = { StaticStrings };

