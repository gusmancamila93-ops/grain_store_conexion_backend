export class ApiError extends Error {
  constructor(statusCode, message, code = "ERROR") {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
  }

  static badRequest(message, code) {
    return new ApiError(400, message, code ?? "BAD_REQUEST");
  }

  static unauthorized(message = "No autenticado.") {
    return new ApiError(401, message, "UNAUTHORIZED");
  }

  static forbidden(message = "No tienes permisos para esta acción.") {
    return new ApiError(403, message, "FORBIDDEN");
  }

  static notFound(message = "Recurso no encontrado.") {
    return new ApiError(404, message, "NOT_FOUND");
  }

  static conflict(message, code) {
    return new ApiError(409, message, code ?? "CONFLICT");
  }
}
