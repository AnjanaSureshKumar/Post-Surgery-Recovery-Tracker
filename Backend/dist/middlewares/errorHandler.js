"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.notFoundHandler = notFoundHandler;
exports.errorHandler = errorHandler;
function notFoundHandler(_req, res) {
    return res.status(404).json({ success: false, message: "Route not found" });
}
function errorHandler(err, _req, res, _next) {
    const statusCode = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    const details = err.errors || undefined;
    return res.status(statusCode).json({ success: false, message, details });
}
