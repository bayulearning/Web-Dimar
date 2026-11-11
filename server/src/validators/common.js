import { ValidationError } from "../utils/AppError.js";

export function parseOrThrow(schema, payload) {
  const result = schema.safeParse(payload);
  if (result.success) return result.data;

  const errors = result.error.issues.map((issue) => ({
    field: issue.path.join(".") || "body",
    message: issue.message,
  }));

  throw new ValidationError(errors, "Parameter permintaan tidak valid");
}

export function validateBody(schema) {
  return function validate(req, _res, next) {
    try {
      req.validatedBody = parseOrThrow(schema, req.body);
      next();
    } catch (error) {
      next(error);
    }
  };
}

export function validateQuery(schema) {
  return function validate(req, _res, next) {
    try {
      req.validatedQuery = parseOrThrow(schema, req.query);
      next();
    } catch (error) {
      next(error);
    }
  };
}

export function validateParams(schema) {
  return function validate(req, _res, next) {
    try {
      req.validatedParams = parseOrThrow(schema, req.params);
      next();
    } catch (error) {
      next(error);
    }
  };
}
