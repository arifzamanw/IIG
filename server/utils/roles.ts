/**
 * Centralized role-check helpers.
 * Role names match seeded values: 'Admin', 'Marketing', 'Sales'
 */
type UserWithRole = { role: { name: string } }

export function isSuperAdmin(user: UserWithRole): boolean {
  return user.role.name === 'Admin'
}

export function isSales(user: UserWithRole): boolean {
  return user.role.name === 'Sales'
}

/** Non-Admin and Non-Marketing users (i.e. Sales) have restricted data scope (own records only) */
export function isRestricted(user: UserWithRole): boolean {
  return user.role.name === 'Sales'
}