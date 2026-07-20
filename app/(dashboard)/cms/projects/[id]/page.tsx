'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useParams } from 'next/navigation'
import { ArrowLeft, Building2, MapPin, Calendar, Globe, Loader2, Plus, Trash2, Upload, X, CheckSquare, Square } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from 'sonner'
import Link from 'next/link'
import Image from 'next/image'

const STATUS_COLORS: Record<string, string> = {
  PLANNING: 'bg-blue-50 text-blue-700',
  UNDER_CONSTRUCTION: 'bg-amber-50 text-amber-700',
  COMPLETED: 'bg-green-50 text-green-700',
  CANCELLED: 'bg-red-50 text-red-700',
}

const UNIT_STATUS_COLORS: Record<string, string> = {
  AVAILABLE: 'bg-green-50 text-green-700',
  RESERVED: 'bg-amber-50 text-amber-700',
  SOLD: 'bg-red-50 text-red-700',
}

const MEDIA_TABS = ['IMAGE', 'FLOOR_PLAN', 'BROCHURE', 'MASTER_PLAN', 'DOCUMENT']

type Tab = 'overview' | 'units' | 'amenities' | 'payment-plans' | 'media'

export default function ProjectDetailPage() {
  const { id } = useParams<{ id: string }>()
  const queryClient = useQueryClient()
  const [activeTab, setActiveTab] = useState<Tab>('overview')
  const [showAddUnit, setShowAddUnit] = useState(false)
  const [editingUnit, setEditingUnit] = useState<any>(null)
  const [showAddPlan, setShowAddPlan] = useState(false)
  const [mediaType, setMediaType] = useState('IMAGE')
  const [uploading, setUploading] = useState(false)
  const [planName, setPlanName] = useState('')
  const [planDesc, setPlanDesc] = useState('')

  // -- Queries --
  const { data: project, isLoading } = useQuery({
    queryKey: ['project', id],
    queryFn: async () => {
      const res = await fetch(`/api/cms/projects/${id}`)
      if (!res.ok) throw new Error('Failed to load project')
      return res.json()
    }
  })

  const { data: units = [] } = useQuery({
    queryKey: ['units', id],
    queryFn: async () => (await fetch(`/api/cms/projects/${id}/units`)).json()
  })

  const { data: allAmenities = [] } = useQuery({
    queryKey: ['amenities'],
    queryFn: async () => (await fetch('/api/cms/amenities')).json()
  })

  const { data: projectAmenities = [] } = useQuery({
    queryKey: ['project-amenities', id],
    queryFn: async () => (await fetch(`/api/cms/projects/${id}/amenities`)).json()
  })

  const { data: paymentPlans = [] } = useQuery({
    queryKey: ['payment-plans', id],
    queryFn: async () => (await fetch(`/api/cms/projects/${id}/payment-plans`)).json()
  })

  const { data: mediaFiles = [] } = useQuery({
    queryKey: ['media', id],
    queryFn: async () => (await fetch(`/api/cms/projects/${id}/media`)).json()
  })

  // -- Derived --
  const linkedAmenityIds = new Set(projectAmenities.map((pa: any) => pa.amenityId))

  // -- Mutations --
  const toggleAmenityMutation = useMutation({
    mutationFn: async (amenityId: number) => {
      const newIds = linkedAmenityIds.has(amenityId)
        ? [...linkedAmenityIds].filter(id => id !== amenityId)
        : [...linkedAmenityIds, amenityId]
      await fetch(`/api/cms/projects/${id}/amenities`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amenityIds: newIds })
      })
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['project-amenities', id] })
  })

  const deleteUnitMutation = useMutation({
    mutationFn: async (unitId: number) => {
      await fetch(`/api/cms/units/${unitId}`, { method: 'DELETE' })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['units', id] })
      toast.success('Unit deleted')
    }
  })

  const createPlanMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/cms/projects/${id}/payment-plans`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: planName, description: planDesc, schedule: [] })
      })
      if (!res.ok) throw new Error('Failed')
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payment-plans', id] })
      setPlanName('')
      setPlanDesc('')
      setShowAddPlan(false)
      toast.success('Payment plan added')
    }
  })

  const deletePlanMutation = useMutation({
    mutationFn: async (planId: number) => {
      await fetch(`/api/cms/payment-plans/${planId}`, { method: 'DELETE' })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payment-plans', id] })
      toast.success('Payment plan removed')
    }
  })

  const deleteMediaMutation = useMutation({
    mutationFn: async (mediaId: number) => {
      await fetch(`/api/cms/media/${mediaId}`, { method: 'DELETE' })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['media', id] })
      toast.success('File deleted')
    }
  })

  const togglePublishMutation = useMutation({
    mutationFn: async (currentlyPublished: boolean) => {
      const res = await fetch(`/api/cms/projects/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isPublished: !currentlyPublished })
      })
      if (!res.ok) throw new Error('Failed to update project status')
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['project', id] })
      toast.success('Project visibility updated')
    }
  })

  // -- Unit add form state --
  const { register: regUnit, handleSubmit: handleUnit, reset: resetUnit } = useForm()

  const createUnitMutation = useMutation({
    mutationFn: async (data: any) => {
      const payload = {
        ...data,
        projectId: Number(id),
        bedrooms: Number(data.bedrooms),
        bathrooms: Number(data.bathrooms),
        size: Number(data.size),
        price: Number(data.price),
        floor: data.floor ? Number(data.floor) : undefined,
        status: data.status || 'AVAILABLE'
      }
      
      const res = await fetch(editingUnit ? `/api/cms/units/${editingUnit.id}` : '/api/cms/units', {
        method: editingUnit ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
      if (!res.ok) throw new Error('Failed')
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['units', id] })
      resetUnit()
      setShowAddUnit(false)
      setEditingUnit(null)
      toast.success(editingUnit ? 'Unit updated' : 'Unit added')
    }
  })

  const openEditUnit = (unit: any) => {
    setEditingUnit(unit)
    resetUnit({
      unitNumber: unit.unitNumber,
      type: unit.type,
      status: unit.status,
      view: unit.view || '',
      bedrooms: unit.bedrooms,
      bathrooms: unit.bathrooms,
      floor: unit.floor || '',
      size: unit.size,
      price: unit.price,
      floorPlanUrl: unit.floorPlanUrl || ''
    })
    setShowAddUnit(true)
  }

  // -- File Upload --
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return
    setUploading(true)
    try {
      for (const file of Array.from(files)) {
        const formData = new FormData()
        formData.append('file', file)
        formData.append('type', mediaType)
        formData.append('projectId', id)
        const uploadRes = await fetch('/api/uploads', { method: 'POST', body: formData })
        if (!uploadRes.ok) { toast.error(`Failed: ${file.name}`); continue }
        const { url, name, size, mimeType } = await uploadRes.json()
        await fetch(`/api/cms/projects/${id}/media`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ type: mediaType, url, name, size, mimeType })
        })
      }
      queryClient.invalidateQueries({ queryKey: ['media', id] })
      toast.success('Files uploaded')
    } finally {
      setUploading(false)
      e.target.value = ''
    }
  }

  if (isLoading) {
    return <div className="flex items-center justify-center h-64"><Loader2 className="w-6 h-6 animate-spin text-neutral-400" /></div>
  }

  const tabs: { id: Tab; label: string; count?: number }[] = [
    { id: 'overview', label: 'Overview' },
    { id: 'units', label: 'Units', count: units.length },
    { id: 'amenities', label: 'Amenities', count: linkedAmenityIds.size },
    { id: 'payment-plans', label: 'Payment Plans', count: paymentPlans.length },
    { id: 'media', label: 'Media', count: mediaFiles.length },
  ]

  const filteredMedia = mediaFiles.filter((m: any) => m.type === mediaType)

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
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="text-2xl font-bold tracking-tight">{project?.name}</h1>
                <span className={`px-2 py-1 text-xs rounded-full font-medium ${STATUS_COLORS[project?.status] || ''}`}>
                  {project?.status?.replace('_', ' ')}
                </span>
                {project?.isPublished ? (
                  <span className="px-2 py-1 text-xs rounded-full font-medium bg-green-100 text-green-800">Published</span>
                ) : (
                  <span className="px-2 py-1 text-xs rounded-full font-medium bg-neutral-100 text-neutral-600">Draft</span>
                )}
              </div>
              <div className="flex items-center gap-4 text-sm text-neutral-500 flex-wrap">
                <span className="flex items-center gap-1"><Building2 className="w-4 h-4" /> {project?.developer?.name}</span>
                <span className="flex items-center gap-1"><MapPin className="w-4 h-4" /> {project?.city}, {project?.country}</span>
                {project?.completionDate && (
                  <span className="flex items-center gap-1"><Calendar className="w-4 h-4" /> {new Date(project.completionDate).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</span>
                )}
                {project?.roi && (
                  <span className="flex items-center gap-1"><Globe className="w-4 h-4" /> ROI: {project.roi}%</span>
                )}
              </div>
              {project?.startingPrice && (
                <p className="text-sm font-semibold text-neutral-800">
                  Starting from {Number(project.startingPrice).toLocaleString()} USD
                </p>
              )}
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3 md:items-center">
              <Button 
                variant={project?.isPublished ? 'outline' : 'default'}
                className={!project?.isPublished ? 'bg-green-600 hover:bg-green-700 text-white' : ''}
                onClick={() => togglePublishMutation.mutate(project?.isPublished)}
                disabled={togglePublishMutation.isPending}
              >
                {togglePublishMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                {project?.isPublished ? 'Unpublish Project' : 'Publish Project'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <div className="border-b border-neutral-200">
        <nav className="flex space-x-0 -mb-px">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-5 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab.id
                  ? 'border-red-600 text-red-600'
                  : 'border-transparent text-neutral-500 hover:text-neutral-800 hover:border-neutral-300'
              }`}
            >
              {tab.label}
              {tab.count !== undefined && tab.count > 0 && (
                <span className={`text-xs px-1.5 py-0.5 rounded-full ${activeTab === tab.id ? 'bg-red-100 text-red-600' : 'bg-neutral-100 text-neutral-500'}`}>
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </nav>
      </div>

      {/* ─── TAB: OVERVIEW ─── */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="shadow-sm">
            <CardContent className="p-6 space-y-1">
              <p className="text-xs text-neutral-500 uppercase tracking-wider font-medium">Total Units</p>
              <p className="text-3xl font-bold">{units.length}</p>
            </CardContent>
          </Card>
          <Card className="shadow-sm">
            <CardContent className="p-6 space-y-1">
              <p className="text-xs text-neutral-500 uppercase tracking-wider font-medium">Available</p>
              <p className="text-3xl font-bold text-green-600">{units.filter((u: any) => u.status === 'AVAILABLE').length}</p>
            </CardContent>
          </Card>
          <Card className="shadow-sm">
            <CardContent className="p-6 space-y-1">
              <p className="text-xs text-neutral-500 uppercase tracking-wider font-medium">Sold</p>
              <p className="text-3xl font-bold text-red-600">{units.filter((u: any) => u.status === 'SOLD').length}</p>
            </CardContent>
          </Card>
          {project?.description && (
            <div className="md:col-span-3">
              <Card className="shadow-sm">
                <CardHeader><CardTitle className="text-sm font-medium text-neutral-500 uppercase">Description</CardTitle></CardHeader>
                <CardContent className="pt-0">
                  <p className="text-sm text-neutral-700 leading-relaxed">{project.description}</p>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      )}

      {/* ─── TAB: UNITS ─── */}
      {activeTab === 'units' && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <Button onClick={() => { setEditingUnit(null); resetUnit(); setShowAddUnit(!showAddUnit) }} className="bg-red-600 hover:bg-red-700">
              <Plus className="w-4 h-4 mr-2" /> Add Unit
            </Button>
          </div>

          {showAddUnit && (
            <Card className="shadow-sm border-red-100">
              <CardHeader><CardTitle className="text-lg">{editingUnit ? 'Edit Unit' : 'New Unit'}</CardTitle></CardHeader>
              <CardContent>
                <form onSubmit={handleUnit((data) => createUnitMutation.mutate(data))} className="space-y-4">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="space-y-1"><Label>Unit Number *</Label><Input placeholder="A-101" {...regUnit('unitNumber', { required: true })} /></div>
                    <div className="space-y-1"><Label>Type *</Label>
                      <select {...regUnit('type', { required: true })} className="flex h-9 w-full rounded-md border border-neutral-200 bg-white px-3 py-1 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-red-500">
                        <option value="">Select...</option>
                        {['APARTMENT','VILLA','TOWNHOUSE','PENTHOUSE','PLOT','COMMERCIAL'].map(t => <option key={t} value={t}>{t.charAt(0)+t.slice(1).toLowerCase()}</option>)}
                      </select>
                    </div>
                    <div className="space-y-1"><Label>Status</Label>
                      <select {...regUnit('status')} defaultValue="AVAILABLE" className="flex h-9 w-full rounded-md border border-neutral-200 bg-white px-3 py-1 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-red-500">
                        <option value="AVAILABLE">Available</option>
                        <option value="RESERVED">Reserved</option>
                        <option value="SOLD">Sold</option>
                      </select>
                    </div>
                    <div className="space-y-1"><Label>View</Label><Input placeholder="Sea View" {...regUnit('view')} /></div>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
                    <div className="space-y-1"><Label>Bedrooms *</Label><Input type="number" min={0} {...regUnit('bedrooms', { required: true })} /></div>
                    <div className="space-y-1"><Label>Bathrooms *</Label><Input type="number" min={0} {...regUnit('bathrooms', { required: true })} /></div>
                    <div className="space-y-1"><Label>Floor</Label><Input type="number" min={0} {...regUnit('floor')} /></div>
                    <div className="space-y-1"><Label>Size (m²) *</Label><Input type="number" step="0.01" {...regUnit('size', { required: true })} /></div>
                    <div className="space-y-1"><Label>Price (USD) *</Label><Input type="number" step="0.01" {...regUnit('price', { required: true })} /></div>
                    <div className="space-y-1 md:col-span-2 lg:col-span-1"><Label>Floor Plan URL</Label><Input placeholder="https://..." {...regUnit('floorPlanUrl')} /></div>
                  </div>
                  <div className="flex gap-3">
                    <Button type="submit" disabled={createUnitMutation.isPending} className="bg-red-600 hover:bg-red-700">
                      {createUnitMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />} {editingUnit ? 'Update Unit' : 'Save Unit'}
                    </Button>
                    <Button type="button" variant="outline" onClick={() => { setShowAddUnit(false); setEditingUnit(null); resetUnit() }}>Cancel</Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}

          <Card className="shadow-sm">
            <CardContent className="p-0">
              {units.length === 0 ? (
                <div className="p-8 text-center text-neutral-500">No units yet. Add the first one.</div>
              ) : (
                <table className="w-full text-sm text-left">
                  <thead className="text-xs text-neutral-500 bg-neutral-50 border-b uppercase">
                    <tr>
                      <th className="px-6 py-3">Unit #</th>
                      <th className="px-6 py-3">Type</th>
                      <th className="px-6 py-3">Floor</th>
                      <th className="px-6 py-3">Beds/Baths</th>
                      <th className="px-6 py-3">Size (m²)</th>
                      <th className="px-6 py-3">Price</th>
                      <th className="px-6 py-3">Status</th>
                      <th className="px-6 py-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {units.map((unit: any) => (
                      <tr key={unit.id} className="bg-white border-b hover:bg-neutral-50 transition-colors">
                        <td className="px-6 py-4 font-medium">
                          {unit.unitNumber}
                          {unit.floorPlanUrl && <a href={unit.floorPlanUrl} target="_blank" rel="noreferrer" className="block text-[10px] text-blue-600 hover:underline mt-1">View Plan</a>}
                        </td>
                        <td className="px-6 py-4 capitalize text-neutral-600">{unit.type.toLowerCase()}</td>
                        <td className="px-6 py-4 text-neutral-600">{unit.floor ?? '—'}</td>
                        <td className="px-6 py-4 text-neutral-600">{unit.bedrooms} / {unit.bathrooms}</td>
                        <td className="px-6 py-4 text-neutral-600">{Number(unit.size).toLocaleString()}</td>
                        <td className="px-6 py-4 font-medium">{Number(unit.price).toLocaleString()} {unit.currency}</td>
                        <td className="px-6 py-4"><span className={`px-2 py-1 text-xs rounded-full font-medium ${UNIT_STATUS_COLORS[unit.status]}`}>{unit.status}</span></td>
                        <td className="px-6 py-4 text-right flex justify-end gap-1">
                          <Button variant="ghost" size="sm" className="text-neutral-500 hover:text-blue-600 h-8 px-2" onClick={() => openEditUnit(unit)}>
                            Edit
                          </Button>
                          <Button variant="ghost" size="sm" className="text-neutral-400 hover:text-red-600 h-8 px-2" onClick={() => deleteUnitMutation.mutate(unit.id)}>
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
      )}

      {/* ─── TAB: AMENITIES ─── */}
      {activeTab === 'amenities' && (
        <div className="space-y-4">
          <p className="text-sm text-neutral-500">Click any amenity to toggle it for this project. Manage your global amenity library in <Link href="/cms/amenities" className="text-red-600 underline">Settings → Amenities</Link>.</p>
          {allAmenities.length === 0 ? (
            <Card className="shadow-sm">
              <CardContent className="p-8 text-center text-neutral-500">
                No amenities created yet. <Link href="/cms/amenities" className="text-red-600 underline">Create amenities first</Link>.
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {allAmenities.map((amenity: any) => {
                const isLinked = linkedAmenityIds.has(amenity.id)
                return (
                  <button
                    key={amenity.id}
                    onClick={() => toggleAmenityMutation.mutate(amenity.id)}
                    className={`flex items-center gap-3 p-4 rounded-xl border-2 text-left transition-all ${
                      isLinked
                        ? 'border-red-500 bg-red-50 text-red-700'
                        : 'border-neutral-200 bg-white text-neutral-700 hover:border-neutral-300'
                    }`}
                  >
                    <span className="text-xl">{amenity.icon || '●'}</span>
                    <span className="text-sm font-medium">{amenity.name}</span>
                    {isLinked ? <CheckSquare className="w-4 h-4 ml-auto text-red-500" /> : <Square className="w-4 h-4 ml-auto text-neutral-300" />}
                  </button>
                )
              })}
            </div>
          )}
        </div>
      )}

      {/* ─── TAB: PAYMENT PLANS ─── */}
      {activeTab === 'payment-plans' && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <Button onClick={() => setShowAddPlan(true)} className="bg-red-600 hover:bg-red-700"><Plus className="w-4 h-4 mr-2" /> Add Plan</Button>
          </div>
          {showAddPlan && (
            <Card className="shadow-sm">
              <CardHeader><CardTitle className="text-lg">New Payment Plan</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-1"><Label>Plan Name *</Label><Input placeholder='e.g. "40/60 Plan"' value={planName} onChange={e => setPlanName(e.target.value)} /></div>
                <div className="space-y-1"><Label>Description</Label><Input placeholder="e.g. 40% on booking, 60% on handover" value={planDesc} onChange={e => setPlanDesc(e.target.value)} /></div>
                <div className="flex gap-3">
                  <Button onClick={() => createPlanMutation.mutate()} disabled={!planName || createPlanMutation.isPending} className="bg-red-600 hover:bg-red-700">Save</Button>
                  <Button variant="outline" onClick={() => setShowAddPlan(false)}>Cancel</Button>
                </div>
              </CardContent>
            </Card>
          )}
          <Card className="shadow-sm">
            <CardContent className="p-0">
              {paymentPlans.length === 0 ? (
                <div className="p-8 text-center text-neutral-500">No payment plans added.</div>
              ) : (
                <div className="divide-y divide-neutral-100">
                  {paymentPlans.map((plan: any) => (
                    <div key={plan.id} className="flex items-center justify-between px-6 py-4 hover:bg-neutral-50">
                      <div>
                        <p className="font-medium text-neutral-900">{plan.name}</p>
                        {plan.description && <p className="text-sm text-neutral-500 mt-0.5">{plan.description}</p>}
                      </div>
                      <Button variant="ghost" size="icon" className="text-neutral-400 hover:text-red-600" onClick={() => deletePlanMutation.mutate(plan.id)}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* ─── TAB: MEDIA ─── */}
      {activeTab === 'media' && (
        <div className="space-y-4">
          {/* Media type sub-tabs */}
          <div className="flex gap-2 flex-wrap">
            {MEDIA_TABS.map(type => (
              <button key={type} onClick={() => setMediaType(type)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${mediaType === type ? 'bg-neutral-900 text-white' : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'}`}>
                {type.replace('_', ' ')}
              </button>
            ))}
          </div>

          {/* Upload zone */}
          <Card className="shadow-sm border-2 border-dashed border-neutral-200 hover:border-red-300 transition-colors">
            <CardContent className="p-8 text-center">
              <input type="file" id="file-upload" className="hidden" multiple accept="image/*,.pdf" onChange={handleFileUpload} />
              <label htmlFor="file-upload" className="cursor-pointer flex flex-col items-center gap-2">
                {uploading ? (
                  <><Loader2 className="w-8 h-8 animate-spin text-neutral-400" /><p className="text-sm text-neutral-500">Uploading...</p></>
                ) : (
                  <><Upload className="w-8 h-8 text-neutral-400" /><p className="text-sm font-medium text-neutral-700">Click to upload {mediaType.replace('_', ' ').toLowerCase()}s</p><p className="text-xs text-neutral-400">JPG, PNG, WebP, PDF — max 10MB each</p></>
                )}
              </label>
            </CardContent>
          </Card>

          {/* Media grid */}
          {filteredMedia.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {filteredMedia.map((file: any) => (
                <div key={file.id} className="group relative rounded-xl overflow-hidden border border-neutral-200 bg-neutral-50 aspect-square">
                  {file.mimeType?.startsWith('image/') ? (
                    <Image src={file.url} alt={file.name || 'media'} fill className="object-cover" />
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full p-4 text-center">
                      <span className="text-3xl">📄</span>
                      <p className="text-xs text-neutral-600 mt-2 line-clamp-2">{file.name}</p>
                    </div>
                  )}
                  <button
                    onClick={() => deleteMediaMutation.mutate(file.id)}
                    className="absolute top-2 right-2 bg-red-600 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity shadow-md"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          )}
          {filteredMedia.length === 0 && <p className="text-center text-sm text-neutral-400 py-4">No {mediaType.replace('_', ' ').toLowerCase()}s uploaded yet.</p>}
        </div>
      )}
    </div>
  )
}
