-- CreateTable
CREATE TABLE "claim_codes" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "dropId" TEXT NOT NULL,
    "claimedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "isUsed" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "claim_codes_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "claim_codes_code_key" ON "claim_codes"("code");

-- CreateIndex
CREATE UNIQUE INDEX "claim_codes_userId_dropId_key" ON "claim_codes"("userId", "dropId");

-- AddForeignKey
ALTER TABLE "claim_codes" ADD CONSTRAINT "claim_codes_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "claim_codes" ADD CONSTRAINT "claim_codes_dropId_fkey" FOREIGN KEY ("dropId") REFERENCES "drops"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
