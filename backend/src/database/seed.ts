import { PrismaClient } from '@prisma/client'
import { logger } from '../utils/logger'

const prisma = new PrismaClient()

async function main() {
  try {
    logger.info('Starting database seed...')

    // Create Texas state
    const texas = await prisma.state.upsert({
      where: { code: 'TX' },
      update: {},
      create: {
        code: 'TX',
        name: 'Texas',
        taxRate: 0.0625, // 6.25% state sales tax
      },
    })

    // Create Harris County
    const harrisCounty = await prisma.county.upsert({
      where: { 
        stateId_name: {
          stateId: texas.id,
          name: 'Harris County'
        }
      },
      update: {},
      create: {
        name: 'Harris County',
        taxRate: 0.0025, // 0.25% county tax
        stateId: texas.id,
      },
    })

    // Create Houston
    await prisma.city.upsert({
      where: { 
        countyId_name: {
          countyId: harrisCounty.id,
          name: 'Houston'
        }
      },
      update: {},
      create: {
        name: 'Houston',
        taxRate: 0.0125, // 1.25% city tax
        countyId: harrisCounty.id,
      },
    })

    // Create Dallas County
    const dallasCounty = await prisma.county.upsert({
      where: { 
        stateId_name: {
          stateId: texas.id,
          name: 'Dallas County'
        }
      },
      update: {},
      create: {
        name: 'Dallas County',
        taxRate: 0.005, // 0.5% county tax
        stateId: texas.id,
      },
    })

    // Create Dallas
    await prisma.city.upsert({
      where: { 
        countyId_name: {
          countyId: dallasCounty.id,
          name: 'Dallas'
        }
      },
      update: {},
      create: {
        name: 'Dallas',
        taxRate: 0.0125, // 1.25% city tax
        countyId: dallasCounty.id,
      },
    })

    // Create Travis County
    const travisCounty = await prisma.county.upsert({
      where: { 
        stateId_name: {
          stateId: texas.id,
          name: 'Travis County'
        }
      },
      update: {},
      create: {
        name: 'Travis County',
        taxRate: 0.0075, // 0.75% county tax
        stateId: texas.id,
      },
    })

    // Create Austin
    await prisma.city.upsert({
      where: { 
        countyId_name: {
          countyId: travisCounty.id,
          name: 'Austin'
        }
      },
      update: {},
      create: {
        name: 'Austin',
        taxRate: 0.01, // 1% city tax
        countyId: travisCounty.id,
      },
    })

    // Create data source record
    await prisma.dataSource.upsert({
      where: { source: 'texas_comptroller' },
      update: {
        lastUpdated: new Date(),
        recordsCount: 6,
        status: 'success'
      },
      create: {
        source: 'texas_comptroller',
        lastUpdated: new Date(),
        recordsCount: 6,
        status: 'success'
      },
    })

    logger.info('Database seeded successfully!')
  } catch (error) {
    logger.error('Error seeding database:', error as Error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
}) 