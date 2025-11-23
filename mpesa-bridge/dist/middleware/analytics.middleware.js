"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.analyticsMiddleware = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
const analyticsMiddleware = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const start = Date.now();
    // Store original end function
    const originalEnd = res.end;
    // Override end function to capture status and duration
    // @ts-ignore
    res.end = function (chunk, encoding) {
        var _a;
        const duration = Date.now() - start;
        const userId = req.userId || ((_a = req.user) === null || _a === void 0 ? void 0 : _a.userId);
        // Only log if user is authenticated and it's an API request
        if (userId && req.path.startsWith('/api')) {
            // Fire and forget - don't await to avoid blocking response
            prisma.apiCall.create({
                data: {
                    userId,
                    endpoint: req.path,
                    method: req.method,
                    status: res.statusCode,
                    duration
                }
            }).catch(err => {
                console.error('Failed to log API call:', err);
            });
        }
        // Call original end
        // @ts-ignore
        originalEnd.apply(res, [chunk, encoding]);
    };
    next();
});
exports.analyticsMiddleware = analyticsMiddleware;
