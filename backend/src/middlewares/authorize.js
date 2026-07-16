import { ApiError } from "#utils/ApiError.js";

export function authorize(...allowedRoles) {
  return function authorizeRole(req, res, next) {
    if (!req.user) {
      throw ApiError.unauthorized();
    }

    if (allowedRoles.length && !allowedRoles.includes(req.user.rol)) {
      throw ApiError.forbidden();
    }

    next();
  };
}
