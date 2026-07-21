'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { UserCircle, Building2, Bell } from 'lucide-react'

export default function SettingsPage() {
  const [isLoading, setIsLoading] = useState(false)

  const [activeTab, setActiveTab] = useState<'profile' | 'company' | 'notifications'>('profile')

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    // Simulate save
    setTimeout(() => {
      setIsLoading(false)
      toast.success('Settings saved successfully')
    }, 1000)
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-neutral-900">Settings</h1>
        <p className="text-neutral-500 mt-2">Manage your account settings and preferences.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="md:col-span-1 space-y-1">
          <button 
            onClick={() => setActiveTab('profile')}
            className={`w-full flex items-center gap-3 px-4 py-2 font-medium rounded-lg transition-colors ${activeTab === 'profile' ? 'bg-neutral-100 text-neutral-900' : 'text-neutral-600 hover:bg-neutral-50'}`}>
            <UserCircle className={`w-5 h-5 ${activeTab === 'profile' ? 'text-neutral-500' : 'text-neutral-400'}`} />
            Profile
          </button>
          <button 
            onClick={() => setActiveTab('company')}
            className={`w-full flex items-center gap-3 px-4 py-2 font-medium rounded-lg transition-colors ${activeTab === 'company' ? 'bg-neutral-100 text-neutral-900' : 'text-neutral-600 hover:bg-neutral-50'}`}>
            <Building2 className={`w-5 h-5 ${activeTab === 'company' ? 'text-neutral-500' : 'text-neutral-400'}`} />
            Company
          </button>
          <button 
            onClick={() => setActiveTab('notifications')}
            className={`w-full flex items-center gap-3 px-4 py-2 font-medium rounded-lg transition-colors ${activeTab === 'notifications' ? 'bg-neutral-100 text-neutral-900' : 'text-neutral-600 hover:bg-neutral-50'}`}>
            <Bell className={`w-5 h-5 ${activeTab === 'notifications' ? 'text-neutral-500' : 'text-neutral-400'}`} />
            Notifications
          </button>
        </div>

        <div className="md:col-span-3 space-y-6">
          <form onSubmit={handleSave}>
            {activeTab === 'profile' && (
              <Card>
                <CardHeader>
                  <CardTitle>Profile Information</CardTitle>
                  <CardDescription>Update your personal details here.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input id="name" placeholder="John Doe" defaultValue="Admin" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input id="email" type="email" placeholder="john@example.com" defaultValue="admin@investgeorgia.com" />
                  </div>
                  
                  <Button type="submit" disabled={isLoading} className="mt-4 bg-blue-600 hover:bg-blue-700">
                    {isLoading ? 'Saving...' : 'Save Changes'}
                  </Button>
                </CardContent>
              </Card>
            )}

            {activeTab === 'company' && (
              <Card>
                <CardHeader>
                  <CardTitle>Company Details</CardTitle>
                  <CardDescription>Update your company information and branding.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="companyName">Company Name</Label>
                    <Input id="companyName" placeholder="Invest Georgia" defaultValue="Invest Georgia" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="website">Website URL</Label>
                    <Input id="website" type="url" placeholder="https://www.investingeorgia.ae" defaultValue="https://www.investingeorgia.ae" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="address">Address</Label>
                    <Input id="address" placeholder="Company Address" defaultValue="Dubai, UAE" />
                  </div>
                  
                  <Button type="submit" disabled={isLoading} className="mt-4 bg-blue-600 hover:bg-blue-700">
                    {isLoading ? 'Saving...' : 'Save Changes'}
                  </Button>
                </CardContent>
              </Card>
            )}

            {activeTab === 'notifications' && (
              <Card>
                <CardHeader>
                  <CardTitle>Notification Preferences</CardTitle>
                  <CardDescription>Choose what updates you want to receive.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-base font-medium text-neutral-900">Email Notifications</Label>
                      <p className="text-sm text-neutral-500">Receive alerts when new proposals are viewed or accepted.</p>
                    </div>
                    <input type="checkbox" className="w-4 h-4 rounded border-neutral-300 text-blue-600 focus:ring-blue-500" defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-base font-medium text-neutral-900">New Lead Alerts</Label>
                      <p className="text-sm text-neutral-500">Get notified when a new lead is assigned to you.</p>
                    </div>
                    <input type="checkbox" className="w-4 h-4 rounded border-neutral-300 text-blue-600 focus:ring-blue-500" defaultChecked />
                  </div>
                  
                  <Button type="submit" disabled={isLoading} className="mt-4 bg-blue-600 hover:bg-blue-700">
                    {isLoading ? 'Saving...' : 'Save Preferences'}
                  </Button>
                </CardContent>
              </Card>
            )}
          </form>
        </div>
      </div>
    </div>
  )
}
