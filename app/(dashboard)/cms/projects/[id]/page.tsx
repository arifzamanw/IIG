'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useParams, useRouter } from 'next/navigation'
import { Plus, Trash2, ArrowLeft, Building2, MapPin, Calendar, Loader2 } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from 'sonner'
import Link from 'next/link'

const toNum = (val: unknown) => (val === '' || val === null || val === undefined ? undefined : Number(val))

// Zod schema used only for runtime validation - not bound to useForm resolver
const unitSchema = z.object({
  unitNumber: z.string().min(1, 'Unit number is required'),
  type: z.enum(['APARTMENT', 'VILLA', 'TOWNHOUSE', 'PENTHOUSE', 'PLOT', 'COMMERCIAL']),
  bedrooms: z.preprocess(toNum, z.number().min(0)),
  bathrooms: z.preprocess(toNum, z.number().min(0)),
  size: z.preprocess(toNum, z.number().positive()),
  price: z.preprocess(toNum, z.number().positive()),
  currency: z.string().default('USD'),
  status: z.enum(['AVAILABLE', 'RESERVED', 'SOLD']).default('AVAILABLE'),
  view: z.string().optional(),
})

// Raw form values (all strings from HTML inputs)
interface UnitFormValues {
  unitNumber: string
  type: string
  bedrooms: string
  bathrooms: string
  size: string
  price: string
  currency: string
  status: string
  view?: string
}

const STATUS_COLORS: Record<string, string> = {
  AVAILABLE: 'bg-green-50 text-green-700',
  RESERVED: 'bg-amber-50 text-amber-700',
  SOLD: 'bg-red-50 text-red-700',
}

const PROJECT_STATUS_COLORS: Record<string, string> = {
  PLANNING: 'bg-blue-50 text-blue-700',
  UNDER_CONSTRUCTION: 'bg-amber-50 text-amber-700',
  COMPLETED: 'bg-green-50 text-green-700',
  CANCELLED: 'bg-red-50 text-red-700',
}

export default function ProjectDetailPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const queryClient = useQueryClient()
  const [showAddUnit, setShowAddUnit] = useState(false)

  const { data: project, isLoading: loadingProject } = useQuery({
    queryKey: ['project', id],
    queryFn: async () => {
      const res = await fetch(`/api/cms/projects/${id}`)
      if (!res.ok) throw new Error('Failed to load project')
      return res.json()
    }
  })

  const { data: units, isLoading: loadingUnits } = useQuery({
    queryKey: ['units', id],
    queryFn: async () => {
      const res = await fetch(`/api/cms/projects/${id}/units`)
      if (!res.ok) throw new Error('Failed to load units')
      return res.json()
    }
  })

  const { register, handleSubmit, reset, formState: { errors }, setError } = useForm<UnitFormValues>({
    defaultValues: { currency: 'USD', status: 'AVAILABLE' }
  })

  const createUnitMutation = useMutation({
    mutationFn: async (data: UnitFormValues) => {
      const res = await fetch('/api/cms/units', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...data, projectId: Number(id) })
      })
      if (!res.ok) throw new Error('Failed to create unit')
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['units', id] })
      reset()
      setShowAddUnit(false)
      toast.success('Unit added successfully')
    },
    onError: () => toast.error('Failed to create unit')
  })

  const onSubmit = (rawData: UnitFormValues) => {
    const parsed = unitSchema.safeParse(rawData)
    if (!parsed.success) {
      const fieldErrors = parsed.error.flatten().fieldErrors
      Object.entries(fieldErrors).forEach(([field, msgs]) => {
        setError(field as keyof UnitFormValues, { message: msgs?.[0] })
      })
      return
    }
    createUnitMutation.mutate(rawData)
  }

  const deleteUnitMutation = useMutation({
    mutationFn: async (unitId: number) => {
      const res = await fetch(`/api/cms/units/${unitId}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Failed to delete unit')
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['units', id] })
      toast.success('Unit deleted')
    },
    onError: () => toast.error('Failed to delete unit')
  })

  if (loadingProject) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-6 h-6 animate-spin text-neutral-400" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center space-x-2 text-sm text-neutral-500">
        <Link href="/cms/projects" className="hover:text-neutral-900 transition-colors flex items-center gap-1">
          <ArrowLeft className="w-4 h-4" /> Projects
        </Link>
        <span>/</span>
        <span className="text-neutral-900 font-medium">{project?.name}</span>
      </div>

      {/* Project Header */}
      <Card className="shadow-sm border-neutral-200">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold tracking-tight">{project?.name}</h1>
                <span className={`px-2 py-1 text-xs rounded-full font-medium ${PROJECT_STATUS_COLORS[project?.status] || ''}`}>
                  {project?.status?.replace('_', ' ')}
                </span>
              </div>
              <div className="flex items-center gap-4 text-sm text-neutral-500">
                <span className="flex items-center gap-1">
                  <Building2 className="w-4 h-4" /> {project?.developer?.name}
                </span>
                <span className="flex items-center gap-1">
                  <MapPin className="w-4 h-4" /> {project?.city}
                </span>
                {project?.completionDate && (
                  <span className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    {new Date(project.completionDate).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                  </span>
                )}
              </div>
              {project?.description && (
                <p className="text-sm text-neutral-600 max-w-2xl">{project.description}</p>
              )}
            </div>
            <div className="shrink-0">
              <Button onClick={() => setShowAddUnit(!showAddUnit)} className="bg-red-600 hover:bg-red-700">
                <Plus className="w-4 h-4 mr-2" /> Add Unit
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Add Unit Form */}
      {showAddUnit && (
        <Card className="shadow-sm border-neutral-200 border-red-100">
          <CardHeader>
            <CardTitle className="text-lg">New Unit</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit((data) => createUnitMutation.mutate(data))} className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="space-y-1">
                  <Label htmlFor="unitNumber">Unit Number *</Label>
                  <Input id="unitNumber" placeholder="e.g. A-101" {...register('unitNumber')} />
                  {errors.unitNumber && <p className="text-xs text-red-600">{errors.unitNumber.message}</p>}
                </div>
                <div className="space-y-1">
                  <Label htmlFor="type">Type *</Label>
                  <select id="type" {...register('type')} className="flex h-9 w-full rounded-md border border-neutral-200 bg-white px-3 py-1 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-red-500">
                    <option value="">Select type...</option>
                    <option value="APARTMENT">Apartment</option>
                    <option value="VILLA">Villa</option>
                    <option value="TOWNHOUSE">Townhouse</option>
                    <option value="PENTHOUSE">Penthouse</option>
                    <option value="PLOT">Plot</option>
                    <option value="COMMERCIAL">Commercial</option>
                  </select>
                  {errors.type && <p className="text-xs text-red-600">{errors.type.message}</p>}
                </div>
                <div className="space-y-1">
                  <Label htmlFor="status">Status *</Label>
                  <select id="status" {...register('status')} className="flex h-9 w-full rounded-md border border-neutral-200 bg-white px-3 py-1 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-red-500">
                    <option value="AVAILABLE">Available</option>
                    <option value="RESERVED">Reserved</option>
                    <option value="SOLD">Sold</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <Label htmlFor="view">View</Label>
                  <Input id="view" placeholder="e.g. Sea View" {...register('view')} />
                </div>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <div className="space-y-1">
                  <Label htmlFor="bedrooms">Bedrooms *</Label>
                  <Input id="bedrooms" type="number" min={0} {...register('bedrooms')} />
                  {errors.bedrooms && <p className="text-xs text-red-600">{errors.bedrooms.message}</p>}
                </div>
                <div className="space-y-1">
                  <Label htmlFor="bathrooms">Bathrooms *</Label>
                  <Input id="bathrooms" type="number" min={0} {...register('bathrooms')} />
                  {errors.bathrooms && <p className="text-xs text-red-600">{errors.bathrooms.message}</p>}
                </div>
                <div className="space-y-1">
                  <Label htmlFor="size">Size (m²) *</Label>
                  <Input id="size" type="number" step="0.01" {...register('size')} />
                  {errors.size && <p className="text-xs text-red-600">{errors.size.message}</p>}
                </div>
                <div className="space-y-1">
                  <Label htmlFor="price">Price *</Label>
                  <Input id="price" type="number" step="0.01" {...register('price')} />
                  {errors.price && <p className="text-xs text-red-600">{errors.price.message}</p>}
                </div>
                <div className="space-y-1">
                  <Label htmlFor="currency">Currency</Label>
                  <select id="currency" {...register('currency')} className="flex h-9 w-full rounded-md border border-neutral-200 bg-white px-3 py-1 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-red-500">
                    <option value="USD">USD</option>
                    <option value="EUR">EUR</option>
                    <option value="GEL">GEL</option>
                  </select>
                </div>
              </div>
              <div className="flex items-center gap-3 pt-2">
                <Button type="submit" disabled={createUnitMutation.isPending} className="bg-red-600 hover:bg-red-700">
                  {createUnitMutation.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                  Save Unit
                </Button>
                <Button type="button" variant="outline" onClick={() => { setShowAddUnit(false); reset() }}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Units Table */}
      <Card className="shadow-sm border-neutral-200">
        <CardHeader className="pb-0">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-semibold">Units ({units?.length ?? 0})</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="p-0 mt-4">
          {loadingUnits ? (
            <div className="p-8 text-center text-neutral-500">
              <Loader2 className="w-5 h-5 animate-spin mx-auto mb-2 text-neutral-400" />
              Loading units...
            </div>
          ) : units?.length === 0 ? (
            <div className="p-8 text-center text-neutral-500">
              No units added yet. Click <strong>Add Unit</strong> to get started.
            </div>
          ) : (
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-neutral-500 bg-neutral-50 border-b uppercase">
                <tr>
                  <th className="px-6 py-3 font-medium">Unit #</th>
                  <th className="px-6 py-3 font-medium">Type</th>
                  <th className="px-6 py-3 font-medium">Beds / Baths</th>
                  <th className="px-6 py-3 font-medium">Size (m²)</th>
                  <th className="px-6 py-3 font-medium">Price</th>
                  <th className="px-6 py-3 font-medium">Status</th>
                  <th className="px-6 py-3 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {units?.map((unit: any) => (
                  <tr key={unit.id} className="bg-white border-b hover:bg-neutral-50 transition-colors">
                    <td className="px-6 py-4 font-medium text-neutral-900">{unit.unitNumber}</td>
                    <td className="px-6 py-4 text-neutral-600 capitalize">{unit.type.toLowerCase()}</td>
                    <td className="px-6 py-4 text-neutral-600">{unit.bedrooms} / {unit.bathrooms}</td>
                    <td className="px-6 py-4 text-neutral-600">{Number(unit.size).toLocaleString()}</td>
                    <td className="px-6 py-4 font-medium text-neutral-900">
                      {Number(unit.price).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })} {unit.currency}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 text-xs rounded-full font-medium ${STATUS_COLORS[unit.status] || ''}`}>
                        {unit.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-neutral-400 hover:text-red-600"
                        onClick={() => deleteUnitMutation.mutate(unit.id)}
                        disabled={deleteUnitMutation.isPending}
                      >
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
