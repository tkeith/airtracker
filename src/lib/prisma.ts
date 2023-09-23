import { PrismaClient } from '@prisma/client'

// Instantiate PrismaClient outside of handler
const prisma = new PrismaClient()

export default prisma