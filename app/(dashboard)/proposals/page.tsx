'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, FileText, Download, Loader2, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { toast } from 'sonner'
import Link from 'next/link'

const STATUS_COLORS: Record<string, string> = {
  DRAFT: 'bg-neutral-100 text-neutral-700',
  SENT: 'bg-blue-50 text-blue-700',
  VIEWED: 'bg-amber-50 text-amber-700',
  ACCEPTED: 'bg-green-50 text-green-700',
  REJECTED: 'bg-red-50 text-red-700',
}

export default function ProposalsPage() {
  const queryClient = useQueryClient()
  const [selectedIds, setSelectedIds] = useState<number[]>([])

  const { data: proposals = [], isLoading } = useQuery({
    queryKey: ['proposals'],
    queryFn: async () => (await fetch('/api/proposals')).json()
  })

  const generatePdfMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await fetch(`/api/proposals/${id}/pdf`, { method: 'POST' })
      if (!res.ok) throw new Error('PDF generation failed')
      return res.json()
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['proposals'] })
      window.open(data.pdfUrl, '_blank')
      toast.success('PDF generated!')
    },
    onError: (e: any) => toast.error(e.message)
  })

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await fetch(`/api/proposals/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Failed to delete')
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['proposals'] })
      toast.success('Proposal deleted')
    }
  })

  const bulkDelete = async () => {
    if (!confirm(`Are you sure you want to delete ${selectedIds.length} proposals?`)) return
    
    for (const id of selectedIds) {
      await fetch(`/api/proposals/${id}`, { method: 'DELETE' })
    }
    queryClient.invalidateQueries({ queryKey: ['proposals'] })
    setSelectedIds([])
    toast.success('Proposals deleted')
  }

  const toggleSelect = (id: number) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id])
  }

  const toggleSelectAll = () => {
    if (selectedIds.length === proposals.length) {
      setSelectedIds([])
    } else {
      setSelectedIds(proposals.map((p: any) => p.id))
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Proposals</h1>
          <p className="text-sm text-neutral-500 mt-1">All generated sales proposals and their status.</p>
        </div>
        <div className="flex gap-2">
          {selectedIds.length > 0 && (
            <Button variant="outline" className="text-red-600 border-red-200 hover:bg-red-50" onClick={bulkDelete}>
              <Trash2 className="w-4 h-4 mr-2" /> Delete Selected ({selectedIds.length})
            </Button>
          )}
          <Link href="/proposals/new">
            <Button className="bg-red-600 hover:bg-red-700">
              <Plus className="w-4 h-4 mr-2" /> New Proposal
            </Button>
          </Link>
        </div>
      </div>

      <Card className="shadow-sm">
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-8 text-center"><Loader2 className="w-5 h-5 animate-spin mx-auto text-neutral-400" /></div>
          ) : proposals.length === 0 ? (
            <div className="p-12 text-center">
              <FileText className="w-10 h-10 text-neutral-300 mx-auto mb-3" />
              <p className="text-neutral-500 font-medium">No proposals yet</p>
              <p className="text-sm text-neutral-400 mb-4">Create your first proposal to get started</p>
              <Link href="/proposals/new">
                <Button className="bg-red-600 hover:bg-red-700"><Plus className="w-4 h-4 mr-2" />New Proposal</Button>
              </Link>
            </div>
          ) : (
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-neutral-500 bg-neutral-50 border-b uppercase">
                <tr>
                  <th className="px-6 py-3 w-10">
                    <input 
                      type="checkbox" 
                      className="rounded border-neutral-300 text-red-600 focus:ring-red-500"
                      checked={selectedIds.length > 0 && selectedIds.length === proposals.length}
                      onChange={toggleSelectAll}
                    />
                  </th>
                  <th className="px-6 py-3">#</th>
                  <th className="px-6 py-3">Customer</th>
                  <th className="px-6 py-3">Created By</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3">Date</th>
                  <th className="px-6 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {proposals.map((p: any) => (
                  <tr key={p.id} className={`bg-white border-b transition-colors ${selectedIds.includes(p.id) ? 'bg-red-50/50' : 'hover:bg-neutral-50'}`}>
                    <td className="px-6 py-4">
                      <input 
                        type="checkbox" 
                        className="rounded border-neutral-300 text-red-600 focus:ring-red-500"
                        checked={selectedIds.includes(p.id)}
                        onChange={() => toggleSelect(p.id)}
                      />
                    </td>
                    <td className="px-6 py-4 font-mono text-neutral-500 text-xs">#{String(p.id).padStart(4, '0')}</td>
                    <td className="px-6 py-4">
                      <p className="font-medium text-neutral-900">{p.customer?.name}</p>
                      <p className="text-xs text-neutral-500">{p.customer?.email}</p>
                    </td>
                    <td className="px-6 py-4 text-neutral-600">{p.createdBy?.name}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 text-xs rounded-full font-medium ${STATUS_COLORS[p.status]}`}>{p.status}</span>
                    </td>
                    <td className="px-6 py-4 text-neutral-500 text-xs">
                      {new Date(p.createdAt).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </td>
                    <td className="px-6 py-4 text-right flex items-center justify-end gap-2">
                      <Link href={`/proposals/${p.id}`}>
                        <Button variant="ghost" size="sm" className="text-neutral-500 hover:text-red-600">
                          <FileText className="w-4 h-4 mr-1" /> View
                        </Button>
                      </Link>
                      <Button variant="ghost" size="sm" className="text-neutral-500 hover:text-red-600"
                        onClick={() => generatePdfMutation.mutate(p.id)}
                        disabled={generatePdfMutation.isPending}>
                        <Download className="w-4 h-4 mr-1" /> PDF
                      </Button>
                      <Button variant="ghost" size="sm" className="text-neutral-400 hover:text-red-600"
                        onClick={() => { if (confirm('Delete proposal?')) deleteMutation.mutate(p.id) }}
                        disabled={deleteMutation.isPending}>
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
