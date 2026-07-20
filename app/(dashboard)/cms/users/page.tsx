'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, Trash2, Loader2, UserCheck, UserX } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from 'sonner'

export default function UsersPage() {
  const queryClient = useQueryClient()
  const [isAdding, setIsAdding] = useState(false)
  const [form, setForm] = useState({ name: '', email: '', password: '', phone: '', roleId: '' })

  const { data: users = [], isLoading } = useQuery({
    queryKey: ['users'],
    queryFn: async () => (await fetch('/api/cms/users')).json()
  })

  const { data: roles = [] } = useQuery({
    queryKey: ['roles'],
    queryFn: async () => (await fetch('/api/cms/roles')).json()
  })

  const createMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch('/api/cms/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, roleId: Number(form.roleId) })
      })
      if (!res.ok) { const e = await res.json(); throw new Error(e.error) }
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
      setForm({ name: '', email: '', password: '', phone: '', roleId: '' })
      setIsAdding(false)
      toast.success('User created')
    },
    onError: (e: any) => toast.error(e.message)
  })

  const toggleMutation = useMutation({
    mutationFn: async ({ id, isActive }: { id: number; isActive: boolean }) => {
      await fetch(`/api/cms/users/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive })
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
      toast.success('User updated')
    }
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Users & Access</h1>
          <p className="text-sm text-neutral-500 mt-1">Manage team members and their roles.</p>
        </div>
        <Button onClick={() => setIsAdding(!isAdding)} className="bg-red-600 hover:bg-red-700">
          <Plus className="w-4 h-4 mr-2" /> Add User
        </Button>
      </div>

      {isAdding && (
        <Card className="shadow-sm">
          <CardHeader><CardTitle className="text-lg">New User</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1"><Label>Full Name *</Label><Input placeholder="John Doe" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} /></div>
              <div className="space-y-1"><Label>Email *</Label><Input type="email" placeholder="john@example.com" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} /></div>
              <div className="space-y-1"><Label>Password *</Label><Input type="password" placeholder="Minimum 8 characters" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} /></div>
              <div className="space-y-1"><Label>Phone</Label><Input placeholder="+1 234 567 890" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} /></div>
              <div className="space-y-1 md:col-span-2"><Label>Role *</Label>
                <select value={form.roleId} onChange={e => setForm({ ...form, roleId: e.target.value })}
                  className="flex h-9 w-full rounded-md border border-neutral-200 bg-white px-3 py-1 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-red-500">
                  <option value="">Select role...</option>
                  {roles.map((r: any) => <option key={r.id} value={r.id}>{r.name}</option>)}
                </select>
              </div>
            </div>
            <div className="flex gap-3">
              <Button onClick={() => createMutation.mutate()} disabled={!form.name || !form.email || !form.password || !form.roleId || createMutation.isPending} className="bg-red-600 hover:bg-red-700">
                {createMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />} Create User
              </Button>
              <Button variant="outline" onClick={() => setIsAdding(false)}>Cancel</Button>
            </div>
          </CardContent>
        </Card>
      )}

      <Card className="shadow-sm">
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-8 text-center"><Loader2 className="w-5 h-5 animate-spin mx-auto text-neutral-400" /></div>
          ) : (
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-neutral-500 bg-neutral-50 border-b uppercase">
                <tr>
                  <th className="px-6 py-3">Name</th>
                  <th className="px-6 py-3">Email</th>
                  <th className="px-6 py-3">Role</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user: any) => (
                  <tr key={user.id} className="bg-white border-b hover:bg-neutral-50 transition-colors">
                    <td className="px-6 py-4 font-medium text-neutral-900">{user.name}</td>
                    <td className="px-6 py-4 text-neutral-600">{user.email}</td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 bg-neutral-100 text-neutral-700 text-xs rounded-full font-medium">{user.role?.name}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 text-xs rounded-full font-medium ${user.isActive ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                        {user.isActive ? 'Active' : 'Disabled'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Button variant="ghost" size="icon"
                        className={`${user.isActive ? 'text-neutral-400 hover:text-red-600' : 'text-neutral-400 hover:text-green-600'}`}
                        onClick={() => toggleMutation.mutate({ id: user.id, isActive: !user.isActive })}>
                        {user.isActive ? <UserX className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
