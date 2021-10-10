-- CreateTable
CREATE TABLE "Places" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "createdById" INTEGER NOT NULL,
    "googleMapsLink" TEXT,

    CONSTRAINT "Places_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Places" ADD CONSTRAINT "Places_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
