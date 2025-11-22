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
class ProjectController {
    static create(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { name, callbackUrl } = req.body;
                if (!name) {
                    res.status(400).json({ error: 'Project name is required' });
                    return;
                }
                // Generate Keys
                const publicKey = `pk_live_${crypto_1.default.randomBytes(12).toString('hex')}`;
                const secretKey = `sk_live_${crypto_1.default.randomBytes(24).toString('hex')}`;
                const project = yield prisma_1.prisma.project.create({
                    data: {
                        name,
                        publicKey,
                        secretKey,
                        callbackUrl
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
}
exports.ProjectController = ProjectController;
