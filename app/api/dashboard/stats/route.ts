import { NextResponse } from 'next/server'
import { getCurrentUser } from '@/server/utils/auth'
import { isRestricted } from '@/server/utils/roles'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const user = await getCurrentUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    // Non-restricted users (Admin/Marketing) see all data. Restricted (Sales) see only their own.
    const isUserRestricted = isRestricted(user)
    const now = new Date()
    const last30Start = new Date(now)
    last30Start.setDate(last30Start.getDate() - 30)
    const prev30Start = new Date(now)
    prev30Start.setDate(prev30Start.getDate() - 60)

    // Customer stats
    const customerWhere = isUserRestricted ? { assignedToId: user.id } : {}
    const [totalCustomers, newCustomersLast30, newCustomersPrev30] = await Promise.all([
      prisma.customer.count({ where: customerWhere }),
      prisma.customer.count({ where: { ...customerWhere, createdAt: { gte: last30Start } } }),
      prisma.customer.count({ where: { ...customerWhere, createdAt: { gte: prev30Start, lt: last30Start } } }),
    ])

    // Proposal stats
    const proposalWhere = isUserRestricted ? { createdById: user.id } : {}
    const [totalProposals, newProposalsLast30, newProposalsPrev30] = await Promise.all([
      prisma.proposal.count({ where: proposalWhere }),
      prisma.proposal.count({ where: { ...proposalWhere, createdAt: { gte: last30Start } } }),
      prisma.proposal.count({ where: { ...proposalWhere, createdAt: { gte: prev30Start, lt: last30Start } } }),
    ])

    // Project stats (always global - no user ownership)
    const [activeProjects, newProjectsLast30, newProjectsPrev30] = await Promise.all([
      prisma.project.count({ where: { status: { in: ['PLANNING', 'UNDER_CONSTRUCTION'] } } }),
      prisma.project.count({ where: { createdAt: { gte: last30Start } } }),
      prisma.project.count({ where: { createdAt: { gte: prev30Start, lt: last30Start } } }),
    ])

    // Recent proposals
    const recentProposals = await prisma.proposal.findMany({
      where: proposalWhere,
      orderBy: { createdAt: 'desc' },
      take: 5,
      include: {
        customer: { select: { id: true, name: true, email: true } },
        createdBy: { select: { id: true, name: true } },
      },
    })

    function pctChange(current: number, previous: number) {
      if (previous === 0) return current > 0 ? 100 : 0
      return Math.round(((current - previous) / previous) * 100)
    }

    return NextResponse.json({
      customers: {
        total: totalCustomers,
        newLast30: newCustomersLast30,
        percentChange: pctChange(newCustomersLast30, newCustomersPrev30),
      },
      proposals: {
        total: totalProposals,
        newLast30: newProposalsLast30,
        percentChange: pctChange(newProposalsLast30, newProposalsPrev30),
      },
      projects: {
        active: activeProjects,
        newLast30: newProjectsLast30,
        percentChange: pctChange(newProjectsLast30, newProjectsPrev30),
      },
      recentProposals,
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}