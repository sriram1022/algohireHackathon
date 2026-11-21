import { prisma } from "../config/prisma.js";

interface CandidateInput {
  fullName: string;
  phone: string;
  email?: string;
  completionDate?: string;
}

interface CreateBatchInput {
  courseName: string;
  candidates: CandidateInput[];
}

export async function createBatch(
  userId: string,
  input: CreateBatchInput
) {
  const courseName = input.courseName.trim();

  // 1. Validate course name
  if (!courseName) {
    throw new Error("Course name is required");
  }

  // 2. Validate candidates
  if (!input.candidates || input.candidates.length === 0) {
    throw new Error("At least one candidate is required");
  }

  // 3. Validate candidate data
  for (const candidate of input.candidates) {
    if (!candidate.fullName?.trim()) {
      throw new Error("Candidate name is required");
    }

    if (!candidate.phone?.trim()) {
      throw new Error(`Phone number is required for ${candidate.fullName}`);
    }

    if (!/^\d{10}$/.test(candidate.phone.trim())) {
      throw new Error(`Invalid phone number for ${candidate.fullName}`);
    }

    if (
      candidate.email &&
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(candidate.email)
    ) {
      throw new Error(`Invalid email for ${candidate.fullName}`);
    }

    if (candidate.completionDate) {
      const date = new Date(candidate.completionDate);

      if (Number.isNaN(date.getTime())) {
        throw new Error(
          `Invalid completion date for ${candidate.fullName}`
        );
      }
    }
  }

  const seenPhones = new Set<string>();
const seenEmails = new Set<string>();

for (const candidate of input.candidates) {
  const phone = candidate.phone.trim();
  const email = candidate.email?.trim().toLowerCase();

  if (seenPhones.has(phone)) {
    throw new Error(`Duplicate phone number: ${phone}`);
  }

  seenPhones.add(phone);

  if (email) {
    if (seenEmails.has(email)) {
      throw new Error(`Duplicate email: ${email}`);
    }

    seenEmails.add(email);
  }
}

  // 4. Fetch logged-in user from database
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user || !user.isActive) {
    throw new Error("User not found or inactive");
  }

  if (user.role !== "TRAINING_CENTRE") {
    throw new Error("Only training centres can create batches");
  }

  if (!user.centreId) {
    throw new Error("Training centre is not assigned to this user");
  }

  // 5. Generate unique batch number
  const batchNumber = `BATCH-${Date.now()}`;

  // 6. Create batch and candidates together
  const batch = await prisma.batch.create({
    data: {
      batchNumber,
      courseName,
      centreId: user.centreId,
      createdById: user.id,
      candidateCount: input.candidates.length,

      candidates: {
        create: input.candidates.map((candidate) => ({
          fullName: candidate.fullName.trim(),
          phone: candidate.phone.trim(),
          email: candidate.email?.trim() || null,
          courseName,
          completionDate: candidate.completionDate
            ? new Date(candidate.completionDate)
            : null,
        })),
      },
    },
    include: {
      candidates: true,
    },
  });

  return batch;
}

export async function getBatchesByCentre(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user || !user.isActive) {
    throw new Error("User not found or inactive");
  }

  if (user.role !== "TRAINING_CENTRE") {
    throw new Error("Only training centres can view their batches");
  }

  if (!user.centreId) {
    throw new Error("Training centre is not assigned");
  }

  const batches = await prisma.batch.findMany({
    where: {
      centreId: user.centreId,
    },
    orderBy: {
      createdAt: "desc",
    },
    select: {
      id: true,
      batchNumber: true,
      courseName: true,
      status: true,
      candidateCount: true,
      createdAt: true,
      submittedAt: true,
    },
  });

  return batches;
}