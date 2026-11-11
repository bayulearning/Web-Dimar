export class AppError extends Error {
  constructor(message, statusCode = 500, errors = []) {
    super(message);
    this.name = "AppError";
    this.statusCode = statusCode;
    this.errors = errors;
    this.isOperational = true;
    Error.captureStackTrace?.(this, this.constructor);
  }
}

export class ValidationError extends AppError {
  constructor(errors = [], message = "Data yang dikirim tidak valid") {
    super(message, 422, errors);
    this.name = "ValidationError";
  }
}

export class NotFoundError extends AppError {
  constructor(message = "Data tidak ditemukan") {
    super(message, 404);
    this.name = "NotFoundError";
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = "Anda harus login terlebih dahulu") {
    super(message, 401);
    this.name = "UnauthorizedError";
  }
}

export class ForbiddenError extends AppError {
  constructor(message = "Anda tidak memiliki akses ke sumber daya ini") {
    super(message, 403);
    this.name = "ForbiddenError";
  }
}
