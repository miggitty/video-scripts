'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@supabase/supabase-js'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { Progress } from '@/components/ui/progress'
import { Loader2, CheckCircle, Play } from 'lucide-react'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

interface Script {
  id: string
  title: string
  script_body: string
  order_index: number
  created_at: string
}

interface Lead {
  id: string
  first_name: string
  company_name: string
}

export default function ResultsPage({ params }: { params: Promise<{ hash: string }> }) {
  const [scripts, setScripts] = useState<Script[]>([])
  const [lead, setLead] = useState<Lead | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [hash, setHash] = useState<string>('')

  useEffect(() => {
    const getHash = async () => {
      const resolvedParams = await params
      setHash(resolvedParams.hash)
    }
    getHash()
  }, [params])

  useEffect(() => {
    if (!hash) return

    const fetchData = async () => {
      try {
        // Fetch lead information
        const { data: leadData, error: leadError } = await supabase
          .from('leads')
          .select('id, first_name, company_name')
          .eq('short_hash', hash)
          .single()

        if (leadError || !leadData) {
          setError('Results not found. Please check your link.')
          setLoading(false)
          return
        }

        setLead(leadData)

        // Fetch existing scripts
        const { data: scriptsData, error: scriptsError } = await supabase
          .from('generated_scripts')
          .select('*')
          .eq('lead_id', leadData.id)
          .order('order_index')

        if (scriptsError) {
          console.error('Error fetching scripts:', scriptsError)
        } else {
          setScripts(scriptsData || [])
        }

        setLoading(false)

        // Set up real-time subscription for new scripts
        const subscription = supabase
          .channel('generated_scripts')
          .on(
            'postgres_changes',
            {
              event: 'INSERT',
              schema: 'public',
              table: 'generated_scripts',
              filter: `lead_id=eq.${leadData.id}`
            },
            (payload) => {
              const newScript = payload.new as Script
              setScripts(prev => {
                const exists = prev.find(s => s.id === newScript.id)
                if (exists) return prev
                return [...prev, newScript].sort((a, b) => a.order_index - b.order_index)
              })
            }
          )
          .subscribe()

        return () => {
          subscription.unsubscribe()
        }
      } catch (error) {
        console.error('Error fetching data:', error)
        setError('Something went wrong. Please try again.')
        setLoading(false)
      }
    }

    fetchData()
  }, [hash])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md text-center">
          <CardContent className="pt-6">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Loading Your Results...</h3>
            <p className="text-gray-600">Please wait while we prepare your personalized video scripts.</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md text-center">
          <CardContent className="pt-6">
            <h3 className="text-lg font-semibold mb-2 text-red-600">Error</h3>
            <p className="text-gray-600">{error}</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  const progress = (scripts.length / 20) * 100
  const isComplete = scripts.length >= 20

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Your AI-Generated Action Plan
          </h1>
          <p className="text-xl text-gray-600">
            Hi {lead?.first_name}! Here&apos;s your personalized marketing strategy for {lead?.company_name}
          </p>
        </div>

        {/* Step 1: Scripts */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span className="bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">1</span>
              Get Your AI-Generated Scripts
            </CardTitle>
            <CardDescription>
              {isComplete ? (
                <div className="flex items-center gap-2 text-green-600">
                  <CheckCircle className="h-4 w-4" />
                  All 20 scripts generated successfully!
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Generating your personalized scripts... ({scripts.length} of 20 complete)
                  </div>
                  <Progress value={progress} className="w-full" />
                </div>
              )}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {scripts.length > 0 ? (
              <Accordion type="single" collapsible className="w-full">
                {scripts.map((script) => (
                  <AccordionItem key={script.id} value={script.id}>
                    <AccordionTrigger className="text-left">
                      <div className="flex items-center gap-3">
                        <span className="bg-gray-100 text-gray-700 rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">
                          {script.order_index}
                        </span>
                        {script.title}
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <pre className="whitespace-pre-wrap text-sm leading-relaxed font-sans text-gray-900">
                          {script.script_body}
                        </pre>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            ) : (
              <div className="text-center py-8">
                <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
                <p className="text-gray-600">Generating your first script...</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Step 2: Record Video */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span className="bg-green-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">2</span>
              Record Your Video
            </CardTitle>
            <CardDescription>
              Choose how you want to create your videos
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-gray-50 p-6 rounded-lg">
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <Play className="h-4 w-4" />
                  Option 1: Record Your Video Manually
                </h3>
                <div className="aspect-video bg-gray-200 rounded-lg flex items-center justify-center mb-4">
                  <p className="text-gray-500">Manual Recording Tutorial Video</p>
                </div>
                <p className="text-sm text-gray-600">
                  Learn how to record professional-looking videos with just your smartphone or webcam.
                </p>
              </div>
              
              <div className="bg-gray-50 p-6 rounded-lg">
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <Play className="h-4 w-4" />
                  Option 2: Use an AI Avatar with HeyGen
                </h3>
                <div className="aspect-video bg-gray-200 rounded-lg flex items-center justify-center mb-4">
                  <p className="text-gray-500">AI Avatar Tutorial Video</p>
                </div>
                <p className="text-sm text-gray-600">
                  Create videos without appearing on camera using AI avatars and text-to-speech technology.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Step 3: Launch Campaign */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span className="bg-purple-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">3</span>
              Launch Your Campaign with Transformo
            </CardTitle>
            <CardDescription className="text-lg">
              <strong>Turn One Video Into a Complete Marketing Campaign</strong>
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center">
              <div className="aspect-video bg-gray-200 rounded-lg flex items-center justify-center mb-6 max-w-2xl mx-auto">
                <p className="text-gray-500">Transformo Demo Video</p>
              </div>
              
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                Turn One Video Into a Complete Marketing Campaign
              </h3>
              <p className="text-lg text-gray-600 mb-8 max-w-3xl mx-auto">
                See how Transformo takes your video and automatically creates blog posts, email newsletters, 
                and social media updates, then distributes them across the internet for you.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3">
                  Start 7-Day Free Trial
                </Button>
                <Button variant="outline" size="lg" className="px-8 py-3">
                  Book a Live Demo
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}