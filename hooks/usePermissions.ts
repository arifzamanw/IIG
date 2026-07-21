import { useQuery } from '@tanstack/react-query'

export type AccessLevel = 'VIEW' | 'EDIT' | 'RESTRICTED'

const levelPower: Record<AccessLevel, number> = {
  RESTRICTED: 0,
  VIEW: 1,
  EDIT: 2
}

export function usePermissions() {
  const { data: user, isLoading } = useQuery({
    queryKey: ['auth-me'],
    queryFn: async () => {
      const res = await fetch('/api/auth/me')
      if (!res.ok) throw new Error('Not authenticated')
      return res.json()
    }
  })

  const hasPermission = (moduleName: string, requiredLevel: AccessLevel): boolean => {
    if (!user || !user.role) return false

    // 1. Super Admins bypass all restrictions
    if (user.role.name === 'Super Admin') return true

    // 2. Check for explicit UserModuleAccess override
    const override = user.moduleAccess?.find((ma: any) => ma.moduleName === moduleName)
    if (override) {
      return levelPower[override.accessLevel as AccessLevel] >= levelPower[requiredLevel]
    }

    // 3. Fallback to Role-based defaults
    if (moduleName === 'Users' || moduleName === 'Settings') {
      // Only Super Admin can access Users and Settings (unless overridden)
      return false
    }

    if (user.role.name === 'Marketing') {
      // Marketing can Edit other modules
      return levelPower['EDIT'] >= levelPower[requiredLevel]
    }

    if (user.role.name === 'Sales') {
      // Sales can only View other modules
      return levelPower['VIEW'] >= levelPower[requiredLevel]
    }

    return false
  }

  return { user, isLoading, hasPermission }
}
