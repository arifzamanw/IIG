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
          <button className="w-full flex items-center gap-3 px-4 py-2 bg-neutral-100 text-neutral-900 font-medium rounded-lg">
            <UserCircle className="w-5 h-5 text-neutral-500" />
            Profile
          </button>
          <button className="w-full flex items-center gap-3 px-4 py-2 text-neutral-600 hover:bg-neutral-50 font-medium rounded-lg">
            <Building2 className="w-5 h-5 text-neutral-400" />
            Company
          </button>
          <button className="w-full flex items-center gap-3 px-4 py-2 text-neutral-600 hover:bg-neutral-50 font-medium rounded-lg">
            <Bell className="w-5 h-5 text-neutral-400" />
            Notifications
          </button>
        </div>

        <div className="md:col-span-3 space-y-6">
          <form onSubmit={handleSave}>
            <Card>
              <CardHeader>
                <CardTitle>Profile Information</CardTitle>
                <CardDescription>Update your personal details here.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input id="name" placeholder="John Doe" defaultValue="Super Admin" />
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
          </form>
        </div>
      </div>
    </div>
  )
}
