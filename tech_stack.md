# 🛠️ M-Pesa Bridge Technology Stack

This document outlines the technical architecture, programming languages, and infrastructure choices for building the **M-Pesa Bridge** system.

## 1. Core Technology Stack

We prioritize **Type Safety**, **Performance**, and **Reliability** for financial transactions.

*   **Language:** **TypeScript** (Node.js Runtime)
    *   *Reasoning:* Provides strict typing to prevent math/logic errors (critical for payments) while maintaining the high concurrency needed for handling thousands of simultaneous WebSocket connections and callbacks.
*   **Framework:** **Express.js**
    *   *Reasoning:* Mature, battle-tested, and lightweight. Massive ecosystem for middleware (security, logging, validation).
*   **Database:** **PostgreSQL**
    *   *Reasoning:* ACID compliance is non-negotiable for a ledger system. We need relational integrity to link Users -> Projects -> Transactions.
*   **ORM:** **Prisma**
    *   *Reasoning:* Best-in-class TypeScript support. Makes database queries type-safe and migrations easy to manage.

## 2. System Architecture

We will utilize a **Modular Monolith** architecture. This keeps deployment simple (one codebase) while keeping concerns separated.

### A. The API Server (The Brain)
*   **REST API:** Handles requests from Client Apps (Initiate Payment, Check Status).
*   **Webhook Receiver:** Listens for callbacks from Safaricom.
*   **WebSocket Server (Socket.io):** Pushes real-time payment confirmations to the Web Widget.

### B. The Worker (Background Process)
*   **Purpose:** Reliability and Resilience.
*   **Responsibilities:**
    *   **Retry Logic:** If a developer's server is down when we try to send a webhook, the worker queues it and retries later (Exponential Backoff).
    *   **Stuck Transactions:** Polls the database for transactions stuck in `PENDING` for > 5 minutes and queries Safaricom to sync the final status.

## 3. Hosting Strategy (Free Tier Optimized)

You can launch Version 1.0 with **$0 upfront cost** using these managed services.

| Component | Service | Tier | Why? |
| :--- | :--- | :--- | :--- |
| **Database** | **Supabase** | **Free** | Managed PostgreSQL. Includes 500MB storage (enough for millions of records) and a nice UI dashboard. |
| **Backend API** | **Render.com** | **Free** | Hosts Node.js web services. Supports auto-deploy from GitHub. (Note: Free tier spins down after inactivity). |
| **Frontend** | **Vercel** | **Free** | Best for hosting the Landing Page, Dashboard, and Documentation. Global CDN included. |
| **Caching** | **Upstash** | **Free** | Serverless Redis. Used for rate-limiting APIs to prevent abuse. |

## 4. Development Tools

*   **Package Manager:** `npm` or `pnpm`
*   **Linting/Formatting:** ESLint + Prettier
*   **Testing:** Jest (Unit Tests) + Supertest (API Integration Tests)
