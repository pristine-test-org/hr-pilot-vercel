import "dotenv/config";
import { PrismaClient, LeaveType, ClaimCategory, RequestStatus } from "../app/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

type EmployeeSeed = {
  name: string;
  username: string;
  jobTitle: string;
  department: string;
  dateJoined: string;
  basicSalary: number;
};

const ADMIN = {
  name: "Nurul Huda (HR Admin)",
  username: "admin",
  email: "admin@hrpilot.com",
  jobTitle: "HR Administrator",
  department: "Human Resources",
  dateJoined: "2021-01-11",
  basicSalary: 9500,
};

const EMPLOYEES: EmployeeSeed[] = [
  { name: "Ahmad Faiz Rahman", username: "ahmad.faiz", jobTitle: "Senior Software Engineer", department: "Engineering", dateJoined: "2022-03-14", basicSalary: 8500 },
  { name: "Siti Aminah Yusof", username: "siti.aminah", jobTitle: "Software Engineer", department: "Engineering", dateJoined: "2023-06-01", basicSalary: 6000 },
  { name: "Tan Wei Jian", username: "wei.jian", jobTitle: "Engineering Manager", department: "Engineering", dateJoined: "2020-09-21", basicSalary: 12000 },
  { name: "Priya Sharma", username: "priya.sharma", jobTitle: "QA Engineer", department: "Quality Assurance", dateJoined: "2022-11-07", basicSalary: 5500 },
  { name: "Muhammad Hafiz Ismail", username: "hafiz.ismail", jobTitle: "DevOps Engineer", department: "Infrastructure", dateJoined: "2021-07-19", basicSalary: 7000 },
  { name: "Nur Alia Zainal", username: "alia.zainal", jobTitle: "Product Manager", department: "Product", dateJoined: "2021-02-08", basicSalary: 9000 },
  { name: "Kevin Lee Chun Wai", username: "kevin.lee", jobTitle: "Software Engineer", department: "Engineering", dateJoined: "2023-01-16", basicSalary: 6000 },
  { name: "Farah Aziz", username: "farah.aziz", jobTitle: "UI/UX Designer", department: "Design", dateJoined: "2022-05-30", basicSalary: 6000 },
  { name: "Rajesh Kumar", username: "rajesh.kumar", jobTitle: "Data Analyst", department: "Data", dateJoined: "2023-04-11", basicSalary: 5800 },
  { name: "Chong Mei Ling", username: "mei.ling", jobTitle: "Senior Software Engineer", department: "Engineering", dateJoined: "2021-10-04", basicSalary: 8500 },
  { name: "Aiman Yusof", username: "aiman.yusof", jobTitle: "Software Engineer", department: "Engineering", dateJoined: "2024-02-19", basicSalary: 5800 },
  { name: "Nadia Rahman", username: "nadia.rahman", jobTitle: "QA Engineer", department: "Quality Assurance", dateJoined: "2022-08-22", basicSalary: 5500 },
  { name: "Daniel Wong", username: "daniel.wong", jobTitle: "DevOps Engineer", department: "Infrastructure", dateJoined: "2023-09-05", basicSalary: 6800 },
  { name: "Syafiqah Ismail", username: "syafiqah.ismail", jobTitle: "Product Designer", department: "Design", dateJoined: "2022-01-17", basicSalary: 6200 },
  { name: "Arun Prakash", username: "arun.prakash", jobTitle: "Data Scientist", department: "Data", dateJoined: "2021-12-13", basicSalary: 8000 },
  { name: "Hafizah Zainal", username: "hafizah.zainal", jobTitle: "Technical Writer", department: "Product", dateJoined: "2023-03-27", basicSalary: 5500 },
  { name: "Lim Jun Hao", username: "jun.hao", jobTitle: "Software Engineer", department: "Engineering", dateJoined: "2024-05-06", basicSalary: 5700 },
  { name: "Zulaikha Osman", username: "zulaikha.osman", jobTitle: "Scrum Master", department: "Product", dateJoined: "2022-06-20", basicSalary: 7500 },
  { name: "Vincent Tan", username: "vincent.tan", jobTitle: "Staff Engineer", department: "Engineering", dateJoined: "2020-04-02", basicSalary: 11000 },
  { name: "Amirul Hakim", username: "amirul.hakim", jobTitle: "IT Support Specialist", department: "Operations", dateJoined: "2023-07-10", basicSalary: 4500 },
];

const EMPLOYEE_PASSWORD = "password123";
const ADMIN_PASSWORD = "admin";

const LEAVE_REASONS: Record<LeaveType, string[]> = {
  ANNUAL: ["Family vacation", "Balik kampung for the holidays", "Personal trip", "Attending a wedding", "Taking time off to recharge"],
  SICK: ["Fever and flu", "Medical appointment", "Down with a cold", "Food poisoning", "Recovering from minor surgery"],
  UNPAID: ["Extended personal matters", "Family emergency", "Additional time off requested"],
};

const CLAIM_DESCRIPTIONS: Record<ClaimCategory, string[]> = {
  FOOD: ["Team lunch with client", "Overtime dinner allowance", "Meals during offsite training", "Working late meal claim"],
  TRAVEL: ["Grab rides to client site", "Parking fees for onsite meeting", "Flight ticket for conference", "Toll and mileage claim"],
  MEDICAL: ["Clinic visit co-payment", "Panel doctor consultation", "Prescription medication"],
  OTHER: ["Work-from-home internet reimbursement", "Office supplies purchase", "Mobile phone bill reimbursement"],
};

function hash(password: string) {
  return bcrypt.hashSync(password, 10);
}

function daysBetween(start: Date, end: Date) {
  return Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
}

async function main() {
  console.log("Seeding database...");

  await prisma.payslip.deleteMany();
  await prisma.claim.deleteMany();
  await prisma.leaveRequest.deleteMany();
  await prisma.session.deleteMany();
  await prisma.user.deleteMany();

  const admin = await prisma.user.create({
    data: {
      name: ADMIN.name,
      email: ADMIN.email,
      username: ADMIN.username,
      passwordHash: hash(ADMIN_PASSWORD),
      role: "ADMIN",
      jobTitle: ADMIN.jobTitle,
      department: ADMIN.department,
      dateJoined: new Date(ADMIN.dateJoined),
    },
  });

  const employees = [];
  for (const emp of EMPLOYEES) {
    const user = await prisma.user.create({
      data: {
        name: emp.name,
        email: `${emp.username}@hrpilot.com`,
        username: emp.username,
        passwordHash: hash(EMPLOYEE_PASSWORD),
        role: "EMPLOYEE",
        jobTitle: emp.jobTitle,
        department: emp.department,
        dateJoined: new Date(emp.dateJoined),
      },
    });
    employees.push({ user, basicSalary: emp.basicSalary });
  }

  console.log(`Created ${employees.length} employees + 1 admin.`);

  const leaveTypes: LeaveType[] = ["ANNUAL", "SICK", "UNPAID"];
  const statuses: RequestStatus[] = ["APPROVED", "APPROVED", "PENDING", "REJECTED"];
  let leaveCount = 0;

  for (let i = 0; i < employees.length; i++) {
    const { user } = employees[i];
    const numRequests = 1 + (i % 3);

    for (let j = 0; j < numRequests; j++) {
      const type = leaveTypes[(i + j) % leaveTypes.length];
      const status = statuses[(i + j) % statuses.length];
      const isFuture = status === "PENDING";

      const baseOffset = isFuture ? 5 + ((i + j) % 20) : -(10 + (i + j) * 3);
      const startDate = new Date();
      startDate.setDate(startDate.getDate() + baseOffset);
      startDate.setHours(0, 0, 0, 0);

      const duration = type === "SICK" ? 1 + (j % 2) : 1 + (j % 4);
      const endDate = new Date(startDate);
      endDate.setDate(endDate.getDate() + duration - 1);

      const reasons = LEAVE_REASONS[type];
      const reason = reasons[(i + j) % reasons.length];

      await prisma.leaveRequest.create({
        data: {
          userId: user.id,
          type,
          startDate,
          endDate,
          days: daysBetween(startDate, endDate),
          reason,
          status,
          decidedById: status === "PENDING" ? null : admin.id,
          decidedAt: status === "PENDING" ? null : new Date(),
        },
      });
      leaveCount++;
    }
  }

  console.log(`Created ${leaveCount} leave requests.`);

  const claimCategories: ClaimCategory[] = ["FOOD", "TRAVEL", "MEDICAL", "OTHER"];
  let claimCount = 0;

  for (let i = 0; i < employees.length; i++) {
    const { user } = employees[i];
    const numClaims = 1 + (i % 3);

    for (let j = 0; j < numClaims; j++) {
      const category = claimCategories[(i + j) % claimCategories.length];
      const status = statuses[(i + j + 1) % statuses.length];

      const claimDate = new Date();
      claimDate.setDate(claimDate.getDate() - (2 + (i + j) * 4));

      const descriptions = CLAIM_DESCRIPTIONS[category];
      const description = descriptions[(i + j) % descriptions.length];

      const amountBands: Record<ClaimCategory, number> = {
        FOOD: 35,
        TRAVEL: 80,
        MEDICAL: 120,
        OTHER: 60,
      };
      const amount = Math.round((amountBands[category] + ((i + j) % 5) * 15) * 100) / 100;

      await prisma.claim.create({
        data: {
          userId: user.id,
          category,
          amount,
          description,
          date: claimDate,
          status,
          decidedById: status === "PENDING" ? null : admin.id,
          decidedAt: status === "PENDING" ? null : new Date(),
        },
      });
      claimCount++;
    }
  }

  console.log(`Created ${claimCount} claims.`);

  const months = ["2026-03", "2026-04", "2026-05", "2026-06"];
  let payslipCount = 0;

  for (const { user, basicSalary } of employees) {
    for (const month of months) {
      const allowances = 500;
      const deductions = Math.round(basicSalary * 0.115 * 100) / 100;
      const netPay = Math.round((basicSalary + allowances - deductions) * 100) / 100;

      await prisma.payslip.create({
        data: {
          userId: user.id,
          month,
          basicSalary,
          allowances,
          deductions,
          netPay,
        },
      });
      payslipCount++;
    }
  }

  console.log(`Created ${payslipCount} payslips.`);
  console.log("Seed complete.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
