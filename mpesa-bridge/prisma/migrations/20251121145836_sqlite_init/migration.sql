-- CreateTable
CREATE TABLE "projects" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "public_key" TEXT NOT NULL,
    "secret_key" TEXT NOT NULL,
    "callback_url" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "transactions" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "project_id" TEXT NOT NULL,
    "merchant_request_id" TEXT,
    "checkout_request_id" TEXT,
    "amount" REAL NOT NULL,
    "phone_number" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "source" TEXT NOT NULL DEFAULT 'DIRECT_API',
    "metadata" TEXT,
    "mpesa_receipt" TEXT,
    "failure_reason" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "transactions_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "projects_public_key_key" ON "projects"("public_key");

-- CreateIndex
CREATE UNIQUE INDEX "projects_secret_key_key" ON "projects"("secret_key");

-- CreateIndex
CREATE UNIQUE INDEX "transactions_merchant_request_id_key" ON "transactions"("merchant_request_id");

-- CreateIndex
CREATE UNIQUE INDEX "transactions_checkout_request_id_key" ON "transactions"("checkout_request_id");
