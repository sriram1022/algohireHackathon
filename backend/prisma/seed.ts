
import { PrismaClient, UserRole } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const demoUsers = [
  {
    name: "Anika",
    email: "anika@certiflow.com",
    role: UserRole.TRAINING_CENTRE,
    centreId: "CENTRE-001",
    districtId: "DISTRICT-001",
  },
  {
    name: "Dev",
    email: "dev@certiflow.com",
    role: UserRole.DISTRICT_OFFICER,
    centreId: null,
    districtId: "DISTRICT-001",
  },
  {
    name: "Meera",
    email: "meera@certiflow.com",
    role: UserRole.DISTRICT_OFFICER,
    centreId: null,
    districtId: "DISTRICT-001",
  },
  {
    name: "Kabir",
    email: "kabir@certiflow.com",
    role: UserRole.QUALITY_OFFICER,
    centreId: null,
    districtId: null,
  },
  {
    name: "Farah",
    email: "farah@certiflow.com",
    role: UserRole.STATE_OFFICER,
    centreId: null,
    districtId: null,
  },
];

async function main() {
  const hashedPassword = await bcrypt.hash("Demo@123", 10);

  for (const user of demoUsers) {
    await prisma.user.upsert({
      where: { email: user.email },
      update: {
        name: user.name,
        role: user.role,
        districtId: user.districtId,
        centreId: user.centreId,
        isActive: true,
      },
      create: {
        ...user,
        passwordHash: hashedPassword,
      },
    });
  }

  console.log("Demo users seeded successfully");
}

main()
  .catch((error) => {
    console.error("Seed failed:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
