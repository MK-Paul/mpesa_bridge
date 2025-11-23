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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProjectController = void 0;
const prisma_1 = require("../config/prisma");
const crypto_1 = __importDefault(require("crypto"));
const encryption_1 = require("../utils/encryption");
class ProjectController {
    static create(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { name, callbackUrl } = req.body;
                const userId = req.userId;
                if (!userId) {
                    res.status(401).json({ error: 'Unauthorized' });
                    return;
                }
                if (!name) {
                    res.status(400).json({ error: 'Project name is required' });
                    return;
                }
                // Generate Keys
                const publicKey = `pk_live_${crypto_1.default.randomBytes(12).toString('hex')}`;
                const secretKey = `sk_live_${crypto_1.default.randomBytes(24).toString('hex')}`;
                const testPublicKey = `pk_test_${crypto_1.default.randomBytes(12).toString('hex')}`;
                const testSecretKey = `sk_test_${crypto_1.default.randomBytes(24).toString('hex')}`;
                const project = yield prisma_1.prisma.project.create({
                    data: {
                        name,
                        publicKey,
                        secretKey,
                        testPublicKey,
                        testSecretKey,
                        callbackUrl,
                        userId
                    }
                });
                res.status(201).json({
                    message: 'Project created successfully',
                    project
                });
            }
            catch (error) {
                console.error('Project Create Error:', error);
                res.status(500).json({ error: 'Internal Server Error' });
            }
        });
    }
    static update(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { id } = req.params;
                const userId = req.userId;
                const { name } = req.body;
                if (!userId) {
                    res.status(401).json({ error: 'Unauthorized' });
                    return;
                }
                const project = yield prisma_1.prisma.project.findFirst({
                    where: { id, userId }
                });
                if (!project) {
                    res.status(404).json({ error: 'Project not found' });
                    return;
                }
                const updatedProject = yield prisma_1.prisma.project.update({
                    where: { id },
                    data: { name },
                });
                res.status(200).json({
                    message: 'Project updated successfully',
                    project: updatedProject
                });
            }
            catch (error) {
                console.error('Project Update Error:', error);
                res.status(500).json({ error: 'Internal Server Error' });
            }
        });
    }
    static delete(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { id } = req.params;
                const userId = req.userId;
                if (!userId) {
                    res.status(401).json({ error: 'Unauthorized' });
                    return;
                }
                // Verify ownership
                const project = yield prisma_1.prisma.project.findFirst({
                    where: { id, userId }
                });
                if (!project) {
                    res.status(404).json({ error: 'Project not found' });
                    return;
                }
                yield prisma_1.prisma.project.delete({
                    where: { id }
                });
                res.status(200).json({ message: 'Project deleted successfully' });
            }
            catch (error) {
                console.error('Project Delete Error:', error);
                res.status(500).json({ error: 'Internal Server Error' });
            }
        });
    }
    /**
     * Regenerate API keys for a project
     * PUT /api/v1/projects/:id/regenerate
     */
    static regenerateKeys(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const userId = req.userId;
                const { id } = req.params;
                if (!userId) {
                    res.status(401).json({ error: 'Unauthorized' });
                    return;
                }
                // Verify project belongs to user
                const project = yield prisma_1.prisma.project.findFirst({
                    where: { id, userId }
                });
                if (!project) {
                    res.status(404).json({ error: 'Project not found' });
                    return;
                }
                // Generate new keys
                const publicKey = `pk_live_${crypto_1.default.randomBytes(12).toString('hex')}`;
                const secretKey = `sk_live_${crypto_1.default.randomBytes(24).toString('hex')}`;
                const testPublicKey = `pk_test_${crypto_1.default.randomBytes(12).toString('hex')}`;
                const testSecretKey = `sk_test_${crypto_1.default.randomBytes(24).toString('hex')}`;
                const updatedProject = yield prisma_1.prisma.project.update({
                    where: { id },
                    data: {
                        publicKey,
                        secretKey,
                        testPublicKey,
                        testSecretKey
                    },
                    select: {
                        id: true,
                        name: true,
                        publicKey: true,
                        secretKey: true,
                        testPublicKey: true,
                        testSecretKey: true,
                        updatedAt: true
                    }
                });
                res.status(200).json({
                    message: 'API keys regenerated successfully',
                    project: updatedProject
                });
            }
            catch (error) {
                console.error('Regenerate keys error:', error);
                res.status(500).json({ error: 'Internal server error' });
            }
        });
    }
    /**
     * Update webhook configuration
     * PUT /api/v1/projects/:id/webhook
     */
    static updateWebhook(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const userId = req.userId;
                const { id } = req.params;
                const { webhookUrl, webhookSecret } = req.body;
                if (!userId) {
                    res.status(401).json({ error: 'Unauthorized' });
                    return;
                }
                // Verify project belongs to user
                const project = yield prisma_1.prisma.project.findFirst({
                    where: { id, userId }
                });
                if (!project) {
                    res.status(404).json({ error: 'Project not found' });
                    return;
                }
                const updatedProject = yield prisma_1.prisma.project.update({
                    where: { id },
                    data: {
                        webhookUrl: webhookUrl || null,
                        webhookSecret: webhookSecret || null
                    },
                    select: {
                        webhookUrl: true,
                        webhookSecret: true,
                        updatedAt: true
                    }
                });
                res.status(200).json({
                    message: 'Webhook configuration updated successfully',
                    webhook: updatedProject
                });
            }
            catch (error) {
                console.error('Update webhook error:', error);
                res.status(500).json({ error: 'Internal server error' });
            }
        });
    }
    /**
     * Update M-Pesa credentials
     * PUT /api/v1/projects/:id/mpesa-credentials
     */
    static updateMpesaCredentials(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const userId = req.userId;
                const { id } = req.params;
                const { shortCode, consumerKey, consumerSecret, passkey } = req.body;
                if (!userId) {
                    res.status(401).json({ error: 'Unauthorized' });
                    return;
                }
                // Verify project belongs to user
                const project = yield prisma_1.prisma.project.findFirst({
                    where: { id, userId }
                });
                if (!project) {
                    res.status(404).json({ error: 'Project not found' });
                    return;
                }
                // Encrypt secrets if provided
                const encryptedConsumerKey = consumerKey ? (0, encryption_1.encrypt)(consumerKey) : undefined;
                const encryptedConsumerSecret = consumerSecret ? (0, encryption_1.encrypt)(consumerSecret) : undefined;
                const encryptedPasskey = passkey ? (0, encryption_1.encrypt)(passkey) : undefined;
                // Prepare update data
                const updateData = {};
                if (shortCode !== undefined)
                    updateData.shortCode = shortCode || null;
                if (encryptedConsumerKey !== undefined)
                    updateData.consumerKey = encryptedConsumerKey || null;
                if (encryptedConsumerSecret !== undefined)
                    updateData.consumerSecret = encryptedConsumerSecret || null;
                if (encryptedPasskey !== undefined)
                    updateData.passkey = encryptedPasskey || null;
                yield prisma_1.prisma.project.update({
                    where: { id },
                    data: updateData
                });
                res.status(200).json({
                    message: 'M-Pesa credentials updated successfully'
                });
            }
            catch (error) {
                console.error('Update M-Pesa credentials error:', error);
                res.status(500).json({ error: 'Internal server error' });
            }
        });
    }
}
exports.ProjectController = ProjectController;
