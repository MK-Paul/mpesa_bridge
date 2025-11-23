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
exports.authenticateApiKey = void 0;
const prisma_1 = require("../config/prisma");
const authenticateApiKey = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const apiKey = req.headers['x-api-key'];
        if (!apiKey) {
            res.status(401).json({ error: 'API key required. Include x-api-key header.' });
            return;
        }
        // Find project by API key (could be live or test key)
        const project = yield prisma_1.prisma.project.findFirst({
            where: {
                OR: [
                    { publicKey: apiKey },
                    { testPublicKey: apiKey }
                ]
            },
            include: {
                user: {
                    select: {
                        id: true,
                        email: true,
                        status: true
                    }
                }
            }
        });
        if (!project) {
            res.status(401).json({ error: 'Invalid API key' });
            return;
        }
        // Check if user exists and is not banned
        if (!project.user) {
            res.status(403).json({ error: 'User account not found' });
            return;
        }
        if (project.user.status === 'BANNED') {
            res.status(403).json({ error: 'Account suspended. Contact support.' });
            return;
        }
        // Attach project and apiKey to request
        req.project = project;
        req.apiKey = apiKey;
        next();
    }
    catch (error) {
        console.error('API key authentication error:', error);
        res.status(500).json({ error: 'Internal server error' });
        return;
    }
});
exports.authenticateApiKey = authenticateApiKey;
