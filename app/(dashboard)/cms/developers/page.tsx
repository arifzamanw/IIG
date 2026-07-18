'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from 'sonner'

export default function DevelopersPage() {
  const queryClient = useQueryClient()
  const [isAdding, setIsAdding] = useState(false)
  const [newDevName, setNewDevName] = useState('')

  const { data: developers, isLoading } = useQuery({
    queryKey: ['developers'],
    queryFn: async () => {
      const res = await fetch('/api/cms/developers')
      if (!res.ok) throw new Error('Failed to fetch developers')
      return res.json()
    }
  })

  const createMutation = useMutation({
    mutationFn: async (name: string) => {
      const res = await fetch('/api/cms/developers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name })
      })
      if (!res.ok) throw new Error('Failed to create developer')
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['developers'] })
      setIsAdding(false)
      setNewDevName('')
      toast.success('Developer created successfully')
    },
    onError: () => toast.error('Error creating developer')
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Developers</h1>
        <Button onClick={() => setIsAdding(!isAdding)} className="bg-red-600 hover:bg-red-700">
          <Plus className="w-4 h-4 mr-2" /> Add Developer
        </Button>
      </div>

      {isAdding && (
        <Card className="shadow-sm border-neutral-200">
          <CardHeader>
            <CardTitle className="text-lg">New Developer</CardTitle>
          </CardHeader>
          <CardContent className="flex space-x-4">
            <Input 
              placeholder="Developer Name" 
              value={newDevName} 
              onChange={(e) => setNewDevName(e.target.value)} 
              className="max-w-sm"
            />
            <Button 
              onClick={() => createMutation.mutate(newDevName)}
              disabled={!newDevName || createMutation.isPending}
            >
              Save
            </Button>
            <Button variant="outline" onClick={() => setIsAdding(false)}>Cancel</Button>
          </CardContent>
        </Card>
      )}

      <Card className="shadow-sm border-neutral-200">
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-8 text-center text-neutral-500">Loading developers...</div>
          ) : developers?.length === 0 ? (
            <div className="p-8 text-center text-neutral-500">No developers found. Add one to get started.</div>
          ) : (
             <table className="w-full text-sm text-left">
              <thead className="text-xs text-neutral-500 bg-neutral-50 border-b uppercase">
                <tr>
                  <th className="px-6 py-3 font-medium">Name</th>
                  <th className="px-6 py-3 font-medium">Added On</th>
                  <th className="px-6 py-3 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {developers?.map((dev: any) => (
                  <tr key={dev.id} className="bg-white border-b hover:bg-neutral-50 transition-colors">
                    <td className="px-6 py-4 font-medium text-neutral-900">{dev.name}</td>
                    <td className="px-6 py-4 text-neutral-500">{new Date(dev.createdAt).toLocaleDateString()}</td>
                    <td className="px-6 py-4 text-right">
                      <Button variant="ghost" size="icon" className="text-neutral-400 hover:text-red-600">
                        <Trash2 className="w-4 h-4" />
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
