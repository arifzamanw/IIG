import { prisma } from './lib/prisma'
import { generateSalesOfferHtml } from './server/services/SalesOfferHtmlService'

async function main() {
  const dummyProposal = {
    customer: { name: '{{customerName}}' },
    discountPercent: 0,
    snapshot: {
      unit: { price: 100000, unitNumber: '{{unitNumber}}', towerBlock: '{{towerBlock}}' },
      project: { name: '{{projectName}}', completionDate: '2025-01-01', roi: 10 },
      paymentPlans: [],
      amenities: [],
      media: []
    }
  }

  const html = generateSalesOfferHtml(dummyProposal, '{{baseUrl}}')
  
  await prisma.proposalTemplate.create({
    data: {
      name: 'Default Sales Offer',
      content: html,
      isDefault: true
    }
  })

  console.log('Template inserted!')
}

main().catch(console.error).finally(() => prisma.$disconnect())
