'use client'

import { useQuery } from '@tanstack/react-query'
import { Plus, Eye } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import Link from 'next/link'

export default function ProjectsPage() {
  const { data: projects, isLoading } = useQuery({
    queryKey: ['projects'],
    queryFn: async () => {
      const res = await fetch('/api/cms/projects')
      if (!res.ok) throw new Error('Failed to fetch projects')
      return res.json()
    }
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Projects</h1>
        <Button className="bg-red-600 hover:bg-red-700">
          <Plus className="w-4 h-4 mr-2" /> Add Project
        </Button>
      </div>

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
