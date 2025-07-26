'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { supabase, getCurrentUserProfile, Lead, GeneratedScript } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { Progress } from '@/components/ui/progress'
import { ArrowLeft, Building, Mail, Calendar, FileText, Loader2, Target } from 'lucide-react'
import Link from 'next/link'

export default function AdminLeadDetailPage() {
  const [loading, setLoading] = useState(true)
  const [lead, setLead] = useState<Lead | null>(null)
  const [scripts, setScripts] = useState<GeneratedScript[]>([])
  const [error, setError] = useState('')
  const [showAllScripts, setShowAllScripts] = useState(false)
  const [leadId, setLeadId] = useState<string>('')
  const router = useRouter()
  const params = useParams()

  useEffect(() => {
    const getId = async () => {
      if (params.id) {
        const id = Array.isArray(params.id) ? params.id[0] : params.id
        console.log('Setting leadId:', id)
        setLeadId(id)
      }
    }
    getId()
  }, [params])

  useEffect(() => {
    console.log('leadId changed:', leadId)
    if (leadId) {
      checkAdminAccessAndLoadData()
    }
  }, [leadId])

  const loadLeadData = useCallback(async () => {
    try {
      console.log('loadLeadData called with leadId:', leadId)
      // Get lead data
      const { data: leadData, error: leadError } = await supabase
        .from('leads')
        .select('*')
        .eq('id', leadId)
        .single()

      console.log('Lead query result:', { leadData, leadError })

      if (leadError || !leadData) {
        throw new Error('Lead not found')
      }

      setLead(leadData)

      // Get scripts for this lead
      const { data: scriptsData, error: scriptsError } = await supabase
        .from('generated_scripts')
        .select('*')
        .eq('lead_id', leadData.id)
        .order('created_at', { ascending: true })

      if (!scriptsError) {
        setScripts(scriptsData || [])
      }
    } catch (error) {
      console.error('Error loading lead data:', error)
      setError('Failed to load lead data')
    }
  }, [leadId])

  const checkAdminAccessAndLoadData = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        router.push('/sign-in')
        return
      }

      const profile = await getCurrentUserProfile()
      if (!profile?.is_admin) {
        router.push('/contact-admin')
        return
      }

      await loadLeadData()
    } catch (error) {
      console.error('Error checking admin access:', error)
      setError('Failed to verify admin access')
    } finally {
      setLoading(false)
    }
  }, [loadLeadData, router])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/')
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

  if (!lead) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Alert variant="destructive">
          <AlertDescription>Lead not found</AlertDescription>
        </Alert>
      </div>
    )
  }

  const progress = (scripts.length / 20) * 100
  const isComplete = scripts.length >= 20
  const displayedScripts = showAllScripts ? scripts : scripts.slice(0, 3)
  const hasMoreScripts = scripts.length > 3

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-3">
              <Link href="/admin/leads">
                <Button variant="ghost" size="sm" className="mr-4">
                  <ArrowLeft className="w-4 h-4 mr-1" />
                  Back to Leads
                </Button>
              </Link>
              <Building className="w-8 h-8 text-blue-600" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Lead Details</h1>
                <p className="text-sm text-gray-500">{lead.company_name}</p>
              </div>
            </div>
            <Button variant="outline" onClick={handleSignOut}>
              Sign Out
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Lead Information */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Building className="w-5 h-5" />
                <span>Business Information</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-500">Business Name</label>
                <p className="text-sm font-medium">{lead.company_name}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Business Type</label>
                <Badge variant="secondary">{lead.business_type}</Badge>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Email</label>
                <p className="text-sm flex items-center space-x-2">
                  <Mail className="w-4 h-4 text-gray-400" />
                  <span>{lead.email}</span>
                </p>
              </div>
              {lead.website_url && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Website</label>
                  <p className="text-sm">{lead.website_url}</p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Target className="w-5 h-5" />
                <span>Business Description</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm">{lead.business_description}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Calendar className="w-5 h-5" />
                <span>Submission Info</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-500">Submitted</label>
                <p className="text-sm">{formatDate(lead.created_at)}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Location</label>
                <p className="text-sm">{lead.city}, {lead.country}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Lead ID</label>
                <p className="text-xs font-mono bg-gray-100 p-1 rounded">{lead.id}</p>
              </div>
            </CardContent>
          </Card>
        </div>


        {/* Generated Scripts */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <FileText className="w-5 h-5" />
              <span>Generated Video Scripts ({scripts.length})</span>
            </CardTitle>
            <CardDescription>
              AI-generated video scripts for {lead.company_name}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* Progress indicator */}
            {!isComplete && scripts.length > 0 && (
              <div className="p-4 bg-gray-50 rounded-md mb-4">
                <div className="flex items-center gap-2 text-gray-600 mb-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Scripts generated: {scripts.length} of 20
                </div>
                <Progress value={progress} className="w-full" />
              </div>
            )}

            {scripts.length > 0 ? (
              <>
                <Accordion type="single" collapsible className="w-full">
                  {displayedScripts.map((script) => (
                    <AccordionItem key={script.id} value={script.id} className="border-gray-200">
                      <AccordionTrigger className="text-left hover:bg-gray-50 rounded-md px-4 py-4">
                        <div className="flex items-center gap-3 w-full">
                          <span className="bg-blue-100 text-blue-800 rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold shrink-0">
                            {script.order_index}
                          </span>
                          <span className="font-semibold">{script.title}</span>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent>
                        <div className="p-4 text-gray-700 border-t border-gray-200">
                          <div>
                            <h4 className="font-semibold text-sm text-gray-900 mb-2">Script:</h4>
                            <pre className="whitespace-pre-wrap text-sm leading-relaxed font-sans">
                              {script.script_body}
                            </pre>
                          </div>
                          <div className="mt-4 text-xs text-gray-500">
                            Generated: {formatDate(script.created_at)}
                          </div>
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
                
                {/* Show More/Less Button */}
                {hasMoreScripts && (
                  <div className="p-4 text-center border-t border-gray-200 mt-4">
                    <Button
                      onClick={() => setShowAllScripts(!showAllScripts)}
                      variant="outline"
                      className="font-semibold"
                    >
                      {showAllScripts 
                        ? `Show Less Scripts` 
                        : `Show ${scripts.length - 3} More Scripts`
                      }
                    </Button>
                  </div>
                )}

                {/* Loading indicator for remaining scripts */}
                {!showAllScripts && scripts.length > 3 && scripts.length < 20 && (
                  <div className="p-4 text-center text-gray-500 border-t border-gray-200 mt-4">
                    ... and {20 - 3} more scripts available
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <FileText className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p>No scripts generated for this lead yet</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}