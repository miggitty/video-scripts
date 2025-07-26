'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { supabase, getCurrentUserProfile, UserProfile, Lead, GeneratedScript } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ArrowLeft, User, Mail, Calendar, FileText } from 'lucide-react'
import Link from 'next/link'

interface UserWithProfile {
  id: string
  email: string
  created_at: string
  last_sign_in_at: string | null
  profile: UserProfile
}

export default function UserDetailPage() {
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<UserWithProfile | null>(null)
  const [leads, setLeads] = useState<Lead[]>([])
  const [scripts, setScripts] = useState<GeneratedScript[]>([])
  const [error, setError] = useState('')
  const router = useRouter()
  const params = useParams()
  const userId = params.id as string

  useEffect(() => {
    checkAdminAccessAndLoadData()
  }, [userId, router])

  const checkAdminAccessAndLoadData = async () => {
    try {
      const { data: { user: currentUser } } = await supabase.auth.getUser()
      
      if (!currentUser) {
        router.push('/sign-in')
        return
      }

      const profile = await getCurrentUserProfile()
      if (!profile?.is_admin) {
        router.push('/contact-admin')
        return
      }

      await loadUserData()
    } catch (error) {
      console.error('Error checking admin access:', error)
      setError('Failed to verify admin access')
    } finally {
      setLoading(false)
    }
  }

  const loadUserData = async () => {
    try {
      // Get user profile
      const { data: profile, error: profileError } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', userId)
        .single()

      if (profileError) {
        throw new Error('User not found')
      }

      // Get auth user data
      const { data: authUser, error: authError } = await supabase.auth.admin.getUserById(userId)
      
      if (authError || !authUser.user) {
        throw new Error('User not found')
      }

      setUser({
        id: authUser.user.id,
        email: authUser.user.email || '',
        created_at: authUser.user.created_at,
        last_sign_in_at: authUser.user.last_sign_in_at,
        profile
      })

      // Get user's leads
      const { data: userLeads, error: leadsError } = await supabase
        .from('leads')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })

      if (!leadsError) {
        setLeads(userLeads || [])
      }

      // Get user's generated scripts (through leads)
      if (userLeads && userLeads.length > 0) {
        const leadHashes = userLeads.map(lead => lead.hash)
        const { data: userScripts, error: scriptsError } = await supabase
          .from('generated_scripts')
          .select('*')
          .in('lead_hash', leadHashes)
          .order('created_at', { ascending: false })

        if (!scriptsError) {
          setScripts(userScripts || [])
        }
      }
    } catch (error) {
      console.error('Error loading user data:', error)
      setError('Failed to load user data')
    }
  }

  const toggleAdminStatus = async () => {
    if (!user) return

    try {
      const { error } = await supabase
        .from('user_profiles')
        .update({ is_admin: !user.profile.is_admin })
        .eq('id', userId)

      if (error) {
        throw error
      }

      // Reload user data
      await loadUserData()
    } catch (error) {
      console.error('Error updating admin status:', error)
      setError('Failed to update admin status')
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Alert variant="destructive">
          <AlertDescription>User not found</AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center py-6">
            <Link href="/admin">
              <Button variant="ghost" size="sm" className="mr-4">
                <ArrowLeft className="w-4 h-4 mr-1" />
                Back to Dashboard
              </Button>
            </Link>
            <div className="flex items-center space-x-3">
              <User className="w-8 h-8 text-blue-600" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">User Details</h1>
                <p className="text-sm text-gray-500">{user.email}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Mail className="w-5 h-5" />
                <span>Account Information</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-500">Email</label>
                <p className="text-sm">{user.email}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">User ID</label>
                <p className="text-xs font-mono bg-gray-100 p-1 rounded">{user.id}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Status</label>
                <div className="flex items-center space-x-2">
                  <Badge variant={user.profile.is_admin ? "default" : "secondary"}>
                    {user.profile.is_admin ? "Admin" : "Regular User"}
                  </Badge>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={toggleAdminStatus}
                  >
                    {user.profile.is_admin ? "Remove Admin" : "Make Admin"}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Calendar className="w-5 h-5" />
                <span>Activity</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-500">Registered</label>
                <p className="text-sm">{formatDate(user.created_at)}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Last Login</label>
                <p className="text-sm">
                  {user.last_sign_in_at ? formatDate(user.last_sign_in_at) : 'Never'}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <FileText className="w-5 h-5" />
                <span>Usage Stats</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-500">Total Leads</label>
                <p className="text-2xl font-bold">{leads.length}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Generated Scripts</label>
                <p className="text-2xl font-bold">{scripts.length}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="leads" className="space-y-6">
          <TabsList>
            <TabsTrigger value="leads">Leads ({leads.length})</TabsTrigger>
            <TabsTrigger value="scripts">Scripts ({scripts.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="leads">
            <Card>
              <CardHeader>
                <CardTitle>User&apos;s Leads</CardTitle>
                <CardDescription>All business leads submitted by this user</CardDescription>
              </CardHeader>
              <CardContent>
                {leads.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Business Name</TableHead>
                        <TableHead>Industry</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Created</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {leads.map((lead) => (
                        <TableRow key={lead.id}>
                          <TableCell className="font-medium">{lead.business_name}</TableCell>
                          <TableCell>{lead.industry}</TableCell>
                          <TableCell>{lead.email}</TableCell>
                          <TableCell>{formatDate(lead.created_at)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    No leads submitted yet
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="scripts">
            <Card>
              <CardHeader>
                <CardTitle>Generated Scripts</CardTitle>
                <CardDescription>All video scripts generated for this user&apos;s leads</CardDescription>
              </CardHeader>
              <CardContent>
                {scripts.length > 0 ? (
                  <div className="space-y-4">
                    {scripts.map((script) => (
                      <Card key={script.id} className="p-4">
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-semibold">{script.script_title}</h4>
                          <span className="text-xs text-gray-500">
                            {formatDate(script.created_at)}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">
                          <strong>Hook:</strong> {script.hook}
                        </p>
                        <p className="text-sm text-gray-800 line-clamp-3">
                          {script.script_content.substring(0, 200)}...
                        </p>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    No scripts generated yet
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}