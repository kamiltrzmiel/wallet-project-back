export const errMessages = {
  400: 'Bad',
  401: 'Unauthorized',
  402: 'Payment Required',
  403: 'Forbiden',
  404: 'Not found :)',
  405: 'Method Not Allowed',
  406: 'Not Acceptable',
  407: 'Proxy Authentication Required',
  408: 'Request Timeout',
  409: 'Conflict',
  500: 'Internal Server Error',
};

export const errorRequest = (status, message = errMessages[status]) => {
  const err = new Error(message);
  err.status = status;
};
