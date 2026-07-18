'use client'

import { useRouter } from 'next/navigation'
import { useMutation } from '@tanstack/react-query'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { Building2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})

type LoginFormValues = z.infer<typeof loginSchema>

export default function LoginPage() {
  const router = useRouter()
  
  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' }
  })

  const loginMutation = useMutation({
    mutationFn: async (values: LoginFormValues) => {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      })
      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.error || 'Failed to login')
      }
      return res.json()
    },
    onSuccess: () => {
      toast.success('Successfully logged in')
      router.push('/dashboard')
    },
    onError: (error: Error) => {
      toast.error(error.message)
    }
  })

  function onSubmit(data: LoginFormValues) {
    loginMutation.mutate(data)
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-lg border-neutral-200/60 bg-white">
        <CardHeader className="space-y-2 text-center pb-8">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-red-50 text-red-600 rounded-2xl">
              <Building2 className="w-8 h-8" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold tracking-tight">Invest Georgia</CardTitle>
          <CardDescription className="text-neutral-500">
            Sign in to the CMS & Proposal Platform
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input 
                id="email" 
                type="email" 
                placeholder="name@investgeorgia.com"
                {...form.register('email')}
                className={form.formState.errors.email ? 'border-red-500 focus-visible:ring-red-500' : ''}
              />
              {form.formState.errors.email && (
                <p className="text-sm text-red-500">{form.formState.errors.email.message}</p>
              )}
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
              </div>
              <Input 
                id="password" 
                type="password" 
                {...form.register('password')}
                className={form.formState.errors.password ? 'border-red-500 focus-visible:ring-red-500' : ''}
              />
              {form.formState.errors.password && (
                <p className="text-sm text-red-500">{form.formState.errors.password.message}</p>
              )}
            </div>
            
            <Button 
              type="submit" 
              className="w-full bg-red-600 hover:bg-red-700 text-white font-medium shadow-sm transition-all"
              disabled={loginMutation.isPending}
            >
              {loginMutation.isPending ? 'Signing in...' : 'Sign in'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
