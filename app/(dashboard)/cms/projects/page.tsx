'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, Eye, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'
import { toast } from 'sonner'

export default function ProjectsPage() {
  const queryClient = useQueryClient()
  const [isAdding, setIsAdding] = useState(false)
  const [form, setForm] = useState({
    name: '', developerId: '', address: '', city: '', country: 'Georgia', status: 'PLANNING', completionDate: '', startingPrice: '', roi: ''
  })

  const { data: projects, isLoading } = useQuery({
    queryKey: ['projects'],
    queryFn: async () => {
      const res = await fetch('/api/cms/projects')
      if (!res.ok) throw new Error('Failed to fetch projects')
      return res.json()
    }
  })

  const { data: developers = [] } = useQuery({
    queryKey: ['developers'],
    queryFn: async () => (await fetch('/api/cms/developers')).json()
  })

  const createMutation = useMutation({
    mutationFn: async () => {
      const payload = {
        ...form,
        developerId: Number(form.developerId),
        startingPrice: form.startingPrice ? Number(form.startingPrice) : undefined,
        roi: form.roi ? Number(form.roi) : undefined,
        completionDate: form.completionDate ? form.completionDate : undefined,
        address: form.address || 'TBD', // default to TBD if left empty just in case
      }
      const res = await fetch('/api/cms/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
      if (!res.ok) throw new Error('Failed to create project')
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] })
      setForm({ name: '', developerId: '', address: '', city: '', country: 'Georgia', status: 'PLANNING', completionDate: '', startingPrice: '', roi: '' })
      setIsAdding(false)
      toast.success('Project created successfully!')
    },
    onError: () => toast.error('Failed to create project')
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Projects</h1>
        <Button onClick={() => setIsAdding(!isAdding)} className="bg-red-600 hover:bg-red-700">
          <Plus className="w-4 h-4 mr-2" /> Add Project
        </Button>
      </div>

      {isAdding && (
        <Card className="shadow-sm">
          <CardHeader><CardTitle className="text-lg">New Project</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="space-y-1"><Label>Project Name *</Label><Input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} /></div>
              <div className="space-y-1"><Label>Developer *</Label>
                <select value={form.developerId} onChange={e => setForm({ ...form, developerId: e.target.value })}
                  className="flex h-9 w-full rounded-md border border-neutral-200 bg-white px-3 py-1 text-sm shadow-sm">
                  <option value="">Select Developer...</option>
                  {developers.map((d: any) => <option key={d.id} value={d.id}>{d.name}</option>)}
                </select>
              </div>
              <div className="space-y-1"><Label>Status *</Label>
                <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}
                  className="flex h-9 w-full rounded-md border border-neutral-200 bg-white px-3 py-1 text-sm shadow-sm">
                  <option value="PLANNING">Planning</option>
                  <option value="UNDER_CONSTRUCTION">Under Construction</option>
                  <option value="COMPLETED">Completed</option>
                  <option value="CANCELLED">Cancelled</option>
                </select>
              </div>
              <div className="space-y-1"><Label>Address *</Label><Input value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} placeholder="e.g. 123 Rustaveli Ave" /></div>
              <div className="space-y-1"><Label>City *</Label><Input value={form.city} onChange={e => setForm({ ...form, city: e.target.value })} /></div>
              <div className="space-y-1"><Label>Country *</Label><Input value={form.country} onChange={e => setForm({ ...form, country: e.target.value })} /></div>
              <div className="space-y-1"><Label>Completion Date</Label><Input type="date" value={form.completionDate} onChange={e => setForm({ ...form, completionDate: e.target.value })} /></div>
              <div className="space-y-1"><Label>Starting Price (USD)</Label><Input type="number" value={form.startingPrice} onChange={e => setForm({ ...form, startingPrice: e.target.value })} /></div>
              <div className="space-y-1"><Label>Expected ROI (%)</Label><Input type="number" step="0.1" value={form.roi} onChange={e => setForm({ ...form, roi: e.target.value })} /></div>
            </div>
            <div className="flex gap-3">
              <Button onClick={() => createMutation.mutate()} disabled={!form.name || !form.developerId || !form.city || !form.country || createMutation.isPending} className="bg-red-600 hover:bg-red-700">
                {createMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />} Save Project
              </Button>
              <Button variant="outline" onClick={() => setIsAdding(false)}>Cancel</Button>
            </div>
          </CardContent>
        </Card>
      )}

      <Card className="shadow-sm border-neutral-200">
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-8 text-center text-neutral-500">Loading projects...</div>
          ) : projects?.length === 0 ? (
            <div className="p-8 text-center text-neutral-500">No projects found. Add one to get started.</div>
          ) : (
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-neutral-500 bg-neutral-50 border-b uppercase">
                <tr>
                  <th className="px-6 py-3 font-medium">Name</th>
                  <th className="px-6 py-3 font-medium">Developer</th>
                  <th className="px-6 py-3 font-medium">City</th>
                  <th className="px-6 py-3 font-medium">Status</th>
                  <th className="px-6 py-3 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {projects?.map((project: any) => (
                  <tr key={project.id} className="bg-white border-b hover:bg-neutral-50 transition-colors">
                    <td className="px-6 py-4 font-medium text-neutral-900">{project.name}</td>
                    <td className="px-6 py-4 text-neutral-500">{project.developer?.name}</td>
                    <td className="px-6 py-4 text-neutral-500">{project.city}</td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded-full font-medium">
                        {project.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link href={`/cms/projects/${project.id}`}>
                        <Button variant="ghost" size="sm" className="text-neutral-500 hover:text-red-600">
                          <Eye className="w-4 h-4 mr-1" /> View
                        </Button>
                      </Link>
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
