'use client'

import { useState } from 'react'
import { useQuery, useMutation } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { ArrowRight, ArrowLeft, Loader2, Check, FileText, Download, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from 'sonner'

type Step = 1 | 2 | 3 | 4

export default function CreateProposalPage() {
  const router = useRouter()
  const [step, setStep] = useState<Step>(1)

  // Selections
  const [customerSearch, setCustomerSearch] = useState('')
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null)
  const [isNewCustomer, setIsNewCustomer] = useState(false)
  const [newCustomerForm, setNewCustomerForm] = useState({ name: '', email: '', phone: '', nationality: '', source: '' })
  const [selectedDeveloperId, setSelectedDeveloperId] = useState<number | null>(null)
  const [selectedProjectId, setSelectedProjectId] = useState<number | null>(null)
  const [selectedUnit, setSelectedUnit] = useState<any>(null)

  // Customizations
  const [customPrice, setCustomPrice] = useState('')
  const [discountPercent, setDiscountPercent] = useState('')
  const [notes, setNotes] = useState('')
  const [customerMessage, setCustomerMessage] = useState('')
  const [selectedImages, setSelectedImages] = useState<string[]>([])
  const [selectedTemplateId, setSelectedTemplateId] = useState<number | null>(null)
  
  // New Customizations
  const [towerBlock, setTowerBlock] = useState('')
  const [unitCondition, setUnitCondition] = useState('')
  const [paymentPlan, setPaymentPlan] = useState<{ id: number, milestone: string, percentage: number, date: string }[]>([])

  // Data queries
  const { data: searchResults = [] } = useQuery({
    queryKey: ['customer-search', customerSearch],
    queryFn: async () => {
      if (customerSearch.length < 2) return []
      const res = await fetch(`/api/cms/customers/search?q=${encodeURIComponent(customerSearch)}`)
      if (!res.ok) return []
      const data = await res.json()
      return Array.isArray(data) ? data : []
    },
    enabled: customerSearch.length >= 2,
    staleTime: 0,
  })

  const { data: developers = [] } = useQuery({
    queryKey: ['developers'],
    queryFn: async () => (await fetch('/api/cms/developers')).json()
  })

  const { data: projects = [] } = useQuery({
    queryKey: ['projects-published', selectedDeveloperId],
    queryFn: async () => {
      const res = await fetch('/api/cms/projects')
      const all = await res.json()
      return all.filter((p: any) => p.isPublished && (!selectedDeveloperId || p.developerId === selectedDeveloperId))
    },
    enabled: !!selectedDeveloperId
  })

  const { data: units = [] } = useQuery({
    queryKey: ['units', selectedProjectId],
    queryFn: async () => (await fetch(`/api/cms/projects/${selectedProjectId}/units`)).json(),
    enabled: !!selectedProjectId
  })

  const { data: projectMedia = [] } = useQuery({
    queryKey: ['media', selectedProjectId],
    queryFn: async () => (await fetch(`/api/cms/projects/${selectedProjectId}/media`)).json(),
    enabled: !!selectedProjectId && step === 4
  })

  const { data: templates = [] } = useQuery({
    queryKey: ['templates'],
    queryFn: async () => (await fetch('/api/cms/templates')).json(),
    enabled: step === 4
  })

  // Create customer then proposal
  const createProposalMutation = useMutation({
    mutationFn: async () => {
      let customerId = selectedCustomer?.id

      if (isNewCustomer) {
        const custRes = await fetch('/api/cms/customers', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newCustomerForm)
        })
        if (!custRes.ok) throw new Error('Failed to create customer')
        const cust = await custRes.json()
        customerId = cust.id
      }

      const res = await fetch('/api/proposals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerId,
          unitId: selectedUnit.id,
          templateId: selectedTemplateId || undefined,
          customPrice: customPrice ? Number(customPrice) : undefined,
          discountPercent: discountPercent ? Number(discountPercent) : undefined,
          notes,
          customerMessage,
          selectedImages,
          towerBlock,
          unitCondition,
          paymentPlan
        })
      })
      if (!res.ok) { const e = await res.json(); throw new Error(e.error) }
      return res.json()
    },
    onSuccess: (proposal) => {
      toast.success('Proposal created!')
      router.push(`/proposals/${proposal.id}`)
    },
    onError: (e: any) => toast.error(e.message)
  })

  const images = projectMedia.filter((m: any) => m.type === 'IMAGE')
  
  // Also include the unit's floor plan as an available image to select
  if (selectedUnit?.floorPlanUrl && !images.find((m: any) => m.url === selectedUnit.floorPlanUrl)) {
    images.push({ id: 'floorplan', url: selectedUnit.floorPlanUrl, type: 'IMAGE' })
  }

  const toggleImage = (url: string) => {
    setSelectedImages(prev => prev.includes(url) ? prev.filter(u => u !== url) : [...prev, url])
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">New Proposal</h1>
        <p className="text-sm text-neutral-500 mt-1">Follow the steps to build a professional sales proposal.</p>
      </div>

      {/* Step Indicator */}
      <div className="flex items-center gap-2">
        {([1, 2, 3, 4] as Step[]).map((s, i) => (
          <div key={s} className="flex items-center gap-2">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold border-2 transition-all ${
              step > s ? 'bg-green-600 border-green-600 text-white' :
              step === s ? 'bg-red-600 border-red-600 text-white' :
              'border-neutral-300 text-neutral-400'
            }`}>
              {step > s ? <Check className="w-4 h-4" /> : s}
            </div>
            <span className={`text-sm ${step === s ? 'font-medium text-neutral-900' : 'text-neutral-400'}`}>
              {['Customer', 'Property', 'Unit', 'Customize'][i]}
            </span>
            {i < 3 && <div className={`flex-1 h-px w-8 ${step > s ? 'bg-green-500' : 'bg-neutral-200'}`} />}
          </div>
        ))}
      </div>

      {/* ─── STEP 1: CUSTOMER ─── */}
      {step === 1 && (
        <Card className="shadow-sm">
          <CardHeader><CardTitle>Select or Create Customer</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-3">
              <Button variant={!isNewCustomer ? 'default' : 'outline'} onClick={() => setIsNewCustomer(false)}>Existing Customer</Button>
              <Button variant={isNewCustomer ? 'default' : 'outline'} onClick={() => setIsNewCustomer(true)}>New Customer</Button>
            </div>

            {!isNewCustomer ? (
              <div className="space-y-3">
                <div className="space-y-1">
                  <Label>Search by name, email or phone</Label>
                  <Input placeholder="Type to search..." value={customerSearch} onChange={e => setCustomerSearch(e.target.value)} />
                </div>
                {searchResults.length > 0 && (
                  <div className="border border-neutral-200 rounded-lg overflow-hidden">
                    {searchResults.map((c: any) => (
                      <button key={c.id} onClick={() => { setSelectedCustomer(c); setCustomerSearch(c.name) }}
                        className={`w-full flex items-start p-4 text-left hover:bg-neutral-50 border-b last:border-b-0 transition-colors ${selectedCustomer?.id === c.id ? 'bg-red-50' : ''}`}>
                        <div>
                          <p className="font-medium text-sm">{c.name}</p>
                          <p className="text-xs text-neutral-500">{c.email} {c.phone && `· ${c.phone}`}</p>
                        </div>
                        {selectedCustomer?.id === c.id && <Check className="w-4 h-4 text-red-600 ml-auto" />}
                      </button>
                    ))}
                  </div>
                )}
                {selectedCustomer && (
                  <div className="p-4 rounded-xl bg-green-50 border border-green-200 text-sm">
                    <p className="font-medium text-green-800">✓ {selectedCustomer.name}</p>
                    <p className="text-green-700">{selectedCustomer.email} {selectedCustomer.phone && `· ${selectedCustomer.phone}`}</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1"><Label>Full Name *</Label><Input value={newCustomerForm.name} onChange={e => setNewCustomerForm({ ...newCustomerForm, name: e.target.value })} /></div>
                <div className="space-y-1"><Label>Email</Label><Input type="email" value={newCustomerForm.email} onChange={e => setNewCustomerForm({ ...newCustomerForm, email: e.target.value })} /></div>
                <div className="space-y-1"><Label>Phone</Label><Input value={newCustomerForm.phone} onChange={e => setNewCustomerForm({ ...newCustomerForm, phone: e.target.value })} /></div>
                <div className="space-y-1"><Label>Nationality</Label><Input value={newCustomerForm.nationality} onChange={e => setNewCustomerForm({ ...newCustomerForm, nationality: e.target.value })} /></div>
                <div className="space-y-1 md:col-span-2"><Label>Lead Source</Label>
                  <select value={newCustomerForm.source} onChange={e => setNewCustomerForm({ ...newCustomerForm, source: e.target.value })}
                    className="flex h-9 w-full rounded-md border border-neutral-200 bg-white px-3 py-1 text-sm shadow-sm">
                    <option value="">Select...</option>
                    {['Direct','Instagram','Facebook','Referral','Walk-in','Website','Other'].map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </div>
            )}

            <Button onClick={() => setStep(2)} disabled={!isNewCustomer && !selectedCustomer} className="bg-red-600 hover:bg-red-700">
              Next: Select Property <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </CardContent>
        </Card>
      )}

      {/* ─── STEP 2: DEVELOPER + PROJECT ─── */}
      {step === 2 && (
        <Card className="shadow-sm">
          <CardHeader><CardTitle>Select Developer & Project</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1"><Label>Developer *</Label>
              <select value={selectedDeveloperId || ''} onChange={e => { setSelectedDeveloperId(Number(e.target.value)); setSelectedProjectId(null); setSelectedUnit(null) }}
                className="flex h-9 w-full rounded-md border border-neutral-200 bg-white px-3 py-1 text-sm shadow-sm focus:ring-1 focus:ring-red-500">
                <option value="">Select developer...</option>
                {developers.map((d: any) => <option key={d.id} value={d.id}>{d.name}</option>)}
              </select>
            </div>

            {selectedDeveloperId && (
              <div className="space-y-2">
                <Label>Published Projects</Label>
                {projects.length === 0 ? (
                  <p className="text-sm text-neutral-500">No published projects for this developer.</p>
                ) : (
                  <div className="grid grid-cols-1 gap-3">
                    {projects.map((p: any) => (
                      <button key={p.id} onClick={() => { setSelectedProjectId(p.id); setSelectedUnit(null) }}
                        className={`flex items-start p-4 rounded-xl border-2 text-left transition-all ${selectedProjectId === p.id ? 'border-red-500 bg-red-50' : 'border-neutral-200 hover:border-neutral-300'}`}>
                        <div className="flex-1">
                          <p className="font-semibold text-sm">{p.name}</p>
                          <p className="text-xs text-neutral-500 mt-0.5">{p.city}, {p.country}</p>
                        </div>
                        {selectedProjectId === p.id && <Check className="w-4 h-4 text-red-600 mt-1" />}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setStep(1)}><ArrowLeft className="w-4 h-4 mr-2" />Back</Button>
              <Button onClick={() => setStep(3)} disabled={!selectedProjectId} className="bg-red-600 hover:bg-red-700">
                Next: Select Unit <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* ─── STEP 3: UNIT ─── */}
      {step === 3 && (
        <Card className="shadow-sm">
          <CardHeader><CardTitle>Select Unit</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            {units.filter((u: any) => u.status === 'AVAILABLE').length === 0 ? (
              <p className="text-neutral-500 text-sm">No available units in this project.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {units.filter((u: any) => u.status === 'AVAILABLE').map((unit: any) => (
                  <button key={unit.id} onClick={() => setSelectedUnit(unit)}
                    className={`p-4 rounded-xl border-2 text-left transition-all ${selectedUnit?.id === unit.id ? 'border-red-500 bg-red-50' : 'border-neutral-200 hover:border-neutral-300'}`}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-semibold text-sm">Unit {unit.unitNumber}</span>
                      {selectedUnit?.id === unit.id && <Check className="w-4 h-4 text-red-600" />}
                    </div>
                    {unit.floorPlanUrl && (
                      <div className="mb-2 h-24 bg-neutral-100 rounded-lg overflow-hidden border border-neutral-200">
                        <img src={unit.floorPlanUrl} alt="Floor plan" className="w-full h-full object-cover opacity-80" />
                      </div>
                    )}
                    <p className="text-xs text-neutral-500 capitalize">{unit.type.toLowerCase()} · {unit.bedrooms} bed · {unit.bathrooms} bath</p>
                    <p className="text-xs text-neutral-500">{Number(unit.size).toLocaleString()} m²{unit.floor ? ` · Floor ${unit.floor}` : ''}</p>
                    <p className="text-sm font-semibold text-neutral-900 mt-2">{Number(unit.price).toLocaleString()} {unit.currency}</p>
                  </button>
                ))}
              </div>
            )}

            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setStep(2)}><ArrowLeft className="w-4 h-4 mr-2" />Back</Button>
              <Button onClick={() => setStep(4)} disabled={!selectedUnit} className="bg-red-600 hover:bg-red-700">
                Next: Customize <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* ─── STEP 4: CUSTOMIZE & GENERATE ─── */}
      {step === 4 && selectedUnit && (
        <div className="space-y-4">
          {/* Summary Card */}
          <Card className="shadow-sm bg-neutral-50 border-neutral-200">
            <CardContent className="p-4">
              <p className="text-xs text-neutral-500 uppercase font-medium mb-2">Proposal Summary</p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                <div><p className="text-neutral-500 text-xs">Customer</p><p className="font-medium">{selectedCustomer?.name || newCustomerForm.name}</p></div>
                <div><p className="text-neutral-500 text-xs">Unit</p><p className="font-medium">{selectedUnit.unitNumber}</p></div>
                <div><p className="text-neutral-500 text-xs">Base Price</p><p className="font-medium">{Number(selectedUnit.price).toLocaleString()} {selectedUnit.currency}</p></div>
                <div><p className="text-neutral-500 text-xs">Size</p><p className="font-medium">{Number(selectedUnit.size).toLocaleString()} m²</p></div>
              </div>
            </CardContent>
          </Card>

          {/* Customizations */}
          <Card className="shadow-sm">
            <CardHeader><CardTitle>Customizations</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1"><Label>Custom Price (optional)</Label><Input type="number" placeholder={String(Number(selectedUnit.price))} value={customPrice} onChange={e => setCustomPrice(e.target.value)} /></div>
                <div className="space-y-1"><Label>Discount (%)</Label><Input type="number" min={0} max={50} placeholder="0" value={discountPercent} onChange={e => setDiscountPercent(e.target.value)} /></div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1"><Label>Tower/Block</Label><Input placeholder="e.g. Tower A" value={towerBlock} onChange={e => setTowerBlock(e.target.value)} /></div>
                <div className="space-y-1"><Label>Unit Condition</Label><Input placeholder="e.g. Fully Renovated, White Frame" value={unitCondition} onChange={e => setUnitCondition(e.target.value)} /></div>
              </div>
              <div className="space-y-1"><Label>Message to Customer</Label><textarea value={customerMessage} onChange={e => setCustomerMessage(e.target.value)} rows={3} placeholder="Dear [customer name], it is our pleasure to present this exclusive offer..." className="flex w-full rounded-md border border-neutral-200 bg-white px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-red-500" /></div>
              <div className="space-y-1"><Label>Internal Notes</Label><Input placeholder="Private notes (not shown in PDF)..." value={notes} onChange={e => setNotes(e.target.value)} /></div>
              
              <div className="space-y-3 pt-4 border-t border-neutral-100">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-semibold">Detailed Payment Plan</Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setPaymentPlan([...paymentPlan, { id: Date.now(), milestone: '', percentage: 0, date: '' }])}
                  >
                    <Plus className="w-3 h-3 mr-1" /> Add Milestone
                  </Button>
                </div>

                {paymentPlan.length > 0 && (
                  <div className="rounded-lg border border-neutral-200 overflow-hidden">
                    <table className="w-full text-sm">
                      <thead className="bg-neutral-50 text-xs text-neutral-500 uppercase">
                        <tr>
                          <th className="px-3 py-2 text-left w-8">#</th>
                          <th className="px-3 py-2 text-left">Milestone Name</th>
                          <th className="px-3 py-2 text-center w-20">%</th>
                          <th className="px-3 py-2 text-center w-32">Date</th>
                          <th className="px-3 py-2 text-right w-28">Amount USD</th>
                          <th className="px-3 py-2 text-right w-28">Amount AED</th>
                          <th className="px-3 py-2 w-8"></th>
                        </tr>
                      </thead>
                      <tbody>
                        {paymentPlan.map((p, idx) => {
                          const baseForCalc = customPrice ? Number(customPrice) : (Number(selectedUnit.price) * (1 - (discountPercent ? Number(discountPercent) / 100 : 0)))
                          const amtUSD = (baseForCalc * (Number(p.percentage) || 0)) / 100
                          const amtAED = amtUSD * 3.6725
                          return (
                            <tr key={p.id} className="border-t border-neutral-100">
                              <td className="px-3 py-2 text-neutral-400 text-xs">{idx + 1}</td>
                              <td className="px-2 py-1.5">
                                <input
                                  type="text"
                                  placeholder="e.g. Down Payment"
                                  value={p.milestone}
                                  onChange={e => { const n = [...paymentPlan]; n[idx].milestone = e.target.value; setPaymentPlan(n) }}
                                  className="w-full px-2 py-1 text-sm rounded border border-neutral-200 focus:outline-none focus:ring-1 focus:ring-red-400"
                                />
                              </td>
                              <td className="px-2 py-1.5">
                                <input
                                  type="number"
                                  placeholder="0"
                                  min={0}
                                  max={100}
                                  value={p.percentage || ''}
                                  onChange={e => { const n = [...paymentPlan]; n[idx].percentage = Number(e.target.value); setPaymentPlan(n) }}
                                  className="w-full px-2 py-1 text-sm rounded border border-neutral-200 focus:outline-none focus:ring-1 focus:ring-red-400 text-center"
                                />
                              </td>
                              <td className="px-2 py-1.5">
                                <input
                                  type="text"
                                  placeholder="e.g. On Signing"
                                  value={p.date}
                                  onChange={e => { const n = [...paymentPlan]; n[idx].date = e.target.value; setPaymentPlan(n) }}
                                  className="w-full px-2 py-1 text-sm rounded border border-neutral-200 focus:outline-none focus:ring-1 focus:ring-red-400 text-center"
                                />
                              </td>
                              <td className="px-3 py-2 text-right text-sm font-medium text-neutral-700">
                                {amtUSD > 0 ? amtUSD.toLocaleString('en-US', { maximumFractionDigits: 0 }) : '—'}
                              </td>
                              <td className="px-3 py-2 text-right text-sm text-neutral-600">
                                {amtAED > 0 ? amtAED.toLocaleString('en-US', { maximumFractionDigits: 0 }) : '—'}
                              </td>
                              <td className="px-2 py-1.5 text-center">
                                <button
                                  type="button"
                                  onClick={() => setPaymentPlan(paymentPlan.filter(x => x.id !== p.id))}
                                  className="text-neutral-300 hover:text-red-500 transition-colors text-lg font-bold leading-none"
                                  title="Remove"
                                >×</button>
                              </td>
                            </tr>
                          )
                        })}
                      </tbody>
                      <tfoot className="bg-neutral-50 border-t border-neutral-200 text-xs">
                        <tr>
                          <td colSpan={2} className="px-3 py-2 text-neutral-500">Total</td>
                          <td className={`px-3 py-2 text-center font-semibold ${paymentPlan.reduce((a, p) => a + (Number(p.percentage) || 0), 0) === 100 ? 'text-green-600' : 'text-amber-600'}`}>
                            {paymentPlan.reduce((a, p) => a + (Number(p.percentage) || 0), 0)}%
                          </td>
                          <td colSpan={4}></td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                )}
              </div>

              {images.length > 0 && (
                <div className="space-y-2">
                  <Label>Select Images for PDF ({selectedImages.length} selected)</Label>
                  <div className="grid grid-cols-3 md:grid-cols-5 gap-2">
                    {images.map((img: any) => (
                      <button key={img.id} onClick={() => toggleImage(img.url)}
                        className={`relative aspect-square rounded-lg border-2 overflow-hidden transition-all ${selectedImages.includes(img.url) ? 'border-red-500 ring-2 ring-red-200' : 'border-neutral-200'}`}>
                        <img src={img.url} alt="" className="w-full h-full object-cover" />
                        {selectedImages.includes(img.url) && (
                          <div className="absolute inset-0 bg-red-600/20 flex items-center justify-center">
                            <Check className="w-5 h-5 text-red-600" />
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {templates.length > 0 && (
                <div className="space-y-2 pt-2 border-t border-neutral-100">
                  <Label>Proposal Template (Optional)</Label>
                  <select 
                    value={selectedTemplateId || ''} 
                    onChange={e => setSelectedTemplateId(e.target.value ? Number(e.target.value) : null)}
                    className="flex h-9 w-full rounded-md border border-neutral-200 bg-white px-3 py-1 text-sm shadow-sm focus:ring-1 focus:ring-red-500"
                  >
                    <option value="">Use Default System Template</option>
                    {templates.map((t: any) => (
                      <option key={t.id} value={t.id}>{t.name} {t.isDefault ? '(Default)' : ''}</option>
                    ))}
                  </select>
                </div>
              )}
            </CardContent>
          </Card>

          <div className="flex gap-3">
            <Button variant="outline" onClick={() => setStep(3)}><ArrowLeft className="w-4 h-4 mr-2" />Back</Button>
            <Button onClick={() => createProposalMutation.mutate()} disabled={createProposalMutation.isPending} className="bg-red-600 hover:bg-red-700">
              {createProposalMutation.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <FileText className="w-4 h-4 mr-2" />}
              Create Proposal
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
