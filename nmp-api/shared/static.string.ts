export class StaticStrings {
  //Other
  public static INFO_RESPONSE_STATUS_SUCCESS: string = 'success';
  public static ERR_RESPONSE_STATUS_FAIL: string = 'fail';
  public static ERR_INTERNAL_SERVER_ERROR: string = 'Internal Server Error!';
  public static ERR_RECORDS_NOT_FOUND: string = 'Records Not Found!';
  public static ERR_INVALID_TOKEN: string = 'Invalid token!';
  public static ERR_INVALID_INPUT: string = 'Invalid input provided!';
  public static ERR_UNAUTHORIZED: string = 'Unauthorized access!';
  public static ERR_FORBIDDEN: string = 'Forbidden access!';
  public static INFO_RESOURCE_CREATED: string =
    'Resource created successfully.';
  public static INFO_RESOURCE_UPDATED: string =
    'Resource updated successfully.';
  public static INFO_RESOURCE_DELETED: string =
    'Resource deleted successfully.';
  public static ERR_RESOURCE_NOT_FOUND: string = 'Resource not found.';
  public static ERR_DUPLICATE_RECORD: string = 'Duplicate record found.';
  public static ERR_MISSING_PARAMETERS: string = 'Missing required parameters.';
  public static ERR_OPERATION_NOT_PERMITTED: string =
    'Operation not permitted.';
  public static ERR_INVALID_REQUEST: string = 'Invalid request.';
  public static ERR_EMAIL_ALREADY_REGISTERED: string =
    'Email is already registered.';
  public static ERR_USERNAME_ALREADY_TAKEN: string =
    'Username is already taken.';
  public static ERR_PASSWORD_TOO_WEAK: string = 'Password is too weak.';
  public static ERR_LOGIN_FAILED: string = 'Login failed. Invalid credentials.';
  public static INFO_LOGOUT_SUCCESSFUL: string = 'Logout successful.';
  public static INFO_PASSWORD_RESET_LINK_SENT: string =
    'Password reset link has been sent to your email.';
  public static INFO_PASSWORD_RESET_SUCCESSFUL: string =
    'Password reset successful.';
  public static ERR_INVALID_RESET_TOKEN: string =
    'Invalid or expired reset token.';
  public static ERR_RESOURCE_ALREADY_EXISTS: string =
    'Resource already exists.';

  // Token related messages
  public static ERR_EXPIRED_TOKEN: string = 'Token has expired!';
  public static ERR_MISSING_TOKEN: string = 'Missing token!';
  public static ERR_TOKEN_NOT_PROVIDED: string =
    'Token not provided in headers!';
  public static ERR_TOKEN_REVOKED: string = 'Token has been revoked!';

  // API input related messages
  public static ERR_INVALID_EMAIL: string = 'Invalid email address!';
  public static ERR_INVALID_USERNAME: string =
    'Invalid username! Must contain only letters, numbers, underscores, or hyphens.';
  public static ERR_INVALID_PASSWORD: string =
    'Invalid password! Must be at least 8 characters long with at least one uppercase letter, one lowercase letter, one number, and one special character.';

  // HTTP status messages
  public static HTTP_STATUS_OK: string = 'OK';
  public static HTTP_STATUS_CREATED: string = 'Created';
  public static HTTP_STATUS_BAD_REQUEST: string = 'Bad Request';
  public static HTTP_STATUS_UNAUTHORIZED: string = 'Unauthorized';
  public static HTTP_STATUS_FORBIDDEN: string = 'Forbidden';
  public static HTTP_STATUS_NOT_FOUND: string = 'Not Found';
  public static HTTP_STATUS_CONFLICT: string = 'Conflict';
  public static HTTP_STATUS_INTERNAL_SERVER_ERROR: string =
    'Internal Server Error';
  public static HTTP_STATUS_SERVICE_UNAVAILABLE: string = 'Service Unavailable';
}
