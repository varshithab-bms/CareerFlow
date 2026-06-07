export class ApiError extends Error {
  readonly statusCode: number;
  readonly code?: string;

  constructor(
    statusCodeOrMessage: number | string,
    messageOrStatusCode: string | number,
    code?: string
  ) {
    const statusCode =
      typeof statusCodeOrMessage === "number"
        ? statusCodeOrMessage
        : typeof messageOrStatusCode === "number"
        ? messageOrStatusCode
        : 500;
    const message =
      typeof statusCodeOrMessage === "string"
        ? statusCodeOrMessage
        : typeof messageOrStatusCode === "string"
        ? messageOrStatusCode
        : "Unknown error";

    super(message);
    this.name = "ApiError";
    this.statusCode = statusCode;
    this.code = code;
    Object.setPrototypeOf(this, ApiError.prototype);
  }
}
