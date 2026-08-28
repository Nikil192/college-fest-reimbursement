import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // Create Festivals
  const onam = await prisma.festival.create({
    data: {
      name: 'Onam 2026',
      organization: 'Malayali Students Association',
      academicYear: '2026-27',
      allocatedBudget: 50000,
      status: 'ACTIVE',
    },
  })

  const diwali = await prisma.festival.create({
    data: {
      name: 'Diwali 2026',
      organization: 'North Indian Students Association',
      academicYear: '2026-27',
      allocatedBudget: 75000,
      status: 'ACTIVE',
    },
  })

  // Create Payees
  const payee1 = await prisma.payee.create({
    data: {
      name: 'Rahul Kumar',
      studentId: 'STU10234',
      phone: '+919876543210',
      payeeType: 'Student',
    }
  })

  // Create Reimbursement
  const reim1 = await prisma.reimbursement.create({
    data: {
      reimbursementNumber: 'REIM-2026-0001',
      festivalId: onam.id,
      payeeId: payee1.id,
      category: 'Food & Beverage',
      description: 'Traditional food ingredients',
      expenseDate: new Date('2026-08-25T00:00:00Z'),
      requestedAmount: 4500,
      approvedAmount: 4500,
      status: 'PAYMENT_PENDING'
    }
  })

  console.log({ onam, diwali, payee1, reim1 })
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
