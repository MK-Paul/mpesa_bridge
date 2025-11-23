"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const app = (0, express_1.default)();
// Trust proxy - Required for Render/production deployment
app.set('trust proxy', 1);
const transaction_routes_1 = __importDefault(require("./routes/transaction.routes"));
const callback_routes_1 = __importDefault(require("./routes/callback.routes"));
const project_routes_1 = __importDefault(require("./routes/project.routes"));
const auth_routes_1 = __importDefault(require("./routes/auth.routes"));
const user_routes_1 = __importDefault(require("./routes/user.routes"));
const admin_routes_1 = __importDefault(require("./routes/admin.routes"));
const rateLimiter_middleware_1 = require("./middleware/rateLimiter.middleware");
const errorHandler_middleware_1 = require("./middleware/errorHandler.middleware");
const analytics_middleware_1 = require("./middleware/analytics.middleware");
// Middleware
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.use(analytics_middleware_1.analyticsMiddleware);
app.use(rateLimiter_middleware_1.apiLimiter); // Apply general rate limiter to all routes
// Routes
app.use('/api/v1/auth', auth_routes_1.default);
app.use('/api/v1/user', user_routes_1.default);
app.use('/api/v1/admin', admin_routes_1.default);
app.use('/api/v1/transactions', transaction_routes_1.default);
app.use('/api/v1/callbacks', callback_routes_1.default);
app.use('/api/v1/projects', project_routes_1.default);
// Health Check
// Health Check
app.get('/health', (req, res) => {
    res.status(200).json({
        status: 'success',
        message: 'M-Pesa Bridge API is running 🚀',
        version: '1.0.0'
    });
});
// Serve Frontend (SPA)
const path_1 = __importDefault(require("path"));
const frontendPath = path_1.default.join(__dirname, '../dashboard/dist');
app.use(express_1.default.static(frontendPath));
// Handle SPA routing - return index.html for any unknown route
// Handle SPA routing - return index.html for any unknown route
// Handle SPA routing - return index.html for any unknown route
app.use((req, res) => {
    // If it's an API request that wasn't handled, let it fall through to error handler
    if (req.path.startsWith('/api')) {
        return res.status(404).json({ error: 'API endpoint not found' });
    }
    res.sendFile(path_1.default.join(frontendPath, 'index.html'));
});
// Error Handler (must be last)
app.use(errorHandler_middleware_1.errorHandler);
exports.default = app;
