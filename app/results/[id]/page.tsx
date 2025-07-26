'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@supabase/supabase-js'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { Progress } from '@/components/ui/progress'
import { ThemeToggle } from '@/components/theme-toggle'
import { Logo } from '@/components/logo'
import { Loader2 } from 'lucide-react'

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

export default function ResultsPage({ params }: { params: Promise<{ id: string }> }) {
  const [scripts, setScripts] = useState<Script[]>([])
  const [lead, setLead] = useState<Lead | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [id, setId] = useState<string>('')
  const [showAllScripts, setShowAllScripts] = useState(false)

  useEffect(() => {
    const getId = async () => {
      const resolvedParams = await params
      setId(resolvedParams.id)
    }
    getId()
  }, [params])

  useEffect(() => {
    if (!id) return

    const fetchData = async () => {
      try {
        // Fetch lead information
        const { data: leadData, error: leadError } = await supabase
          .from('leads')
          .select('id, first_name, company_name')
          .eq('id', id)
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
  }, [id])

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md text-center bg-card border-border">
          <CardContent className="pt-6">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
            <h3 className="text-lg font-semibold mb-2 text-foreground">Loading Your Results...</h3>
            <p className="text-muted-foreground">Please wait while we prepare your personalized video scripts.</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md text-center bg-card border-border">
          <CardContent className="pt-6">
            <h3 className="text-lg font-semibold mb-2 text-destructive">Error</h3>
            <p className="text-muted-foreground">{error}</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  const progress = (scripts.length / 20) * 100
  const isComplete = scripts.length >= 20
  const displayedScripts = showAllScripts ? scripts : scripts.slice(0, 3)
  const hasMoreScripts = scripts.length > 3

  return (
    <div className="bg-background text-foreground font-sans antialiased">
      {/* Header */}
      <header className="w-full z-10 py-4 px-4 sm:px-6 lg:px-8 border-b border-border">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center space-x-2">
            <Logo width={140} height={42} />
          </div>
          <ThemeToggle />
        </div>
      </header>

      <main>
        {/* Part 1: Deliver the Goods (Gratification) */}
        <section className="py-16 lg:py-20 bg-muted/50 border-b border-border">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto">
              <h1 className="text-4xl md:text-5xl font-extrabold tracking-tighter text-foreground">
                Here Are Your <span className="text-primary">20 Free Video Scripts</span>
              </h1>
              <p className="mt-4 text-lg text-muted-foreground">
                Congratulations, {lead?.first_name}! Below are the proven, high-converting video topics and scripts generated just for <span dangerouslySetInnerHTML={{ __html: lead?.company_name || '' }} />.
              </p>
            </div>
            
            <div className="mt-12 max-w-3xl mx-auto bg-card border border-border rounded-lg shadow-sm p-2 space-y-2">
              {/* Progress indicator */}
              {!isComplete && (
                <div className="p-4 bg-muted/50 rounded-md mb-4">
                  <div className="flex items-center gap-2 text-muted-foreground mb-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Generating your personalized scripts... ({scripts.length} of 20 complete)
                  </div>
                  <Progress value={progress} className="w-full" />
                </div>
              )}

              {/* Scripts Accordion */}
              {scripts.length > 0 ? (
                <>
                  <Accordion type="single" collapsible className="w-full">
                    {displayedScripts.map((script) => (
                      <AccordionItem key={script.id} value={script.id} className="border-border">
                        <AccordionTrigger className="text-left text-card-foreground hover:bg-accent rounded-md px-4 py-4">
                          <div className="flex items-center gap-3 w-full">
                            <span className="bg-muted text-foreground rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold shrink-0">
                              {script.order_index}
                            </span>
                            <span className="font-semibold">{script.title}</span>
                          </div>
                        </AccordionTrigger>
                        <AccordionContent>
                          <div className="p-4 text-muted-foreground border-t border-border">
                            <pre className="whitespace-pre-wrap text-sm leading-relaxed font-sans">
                              {script.script_body}
                            </pre>
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                  
                  {/* Show More/Less Button */}
                  {hasMoreScripts && (
                    <div className="p-4 text-center border-t border-border">
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

                  {/* Show placeholder items for remaining scripts when collapsed */}
                  {!showAllScripts && scripts.length > 3 && scripts.length < 20 && (
                    <div className="p-4 text-center text-muted-foreground border-t border-border">
                      ... and {20 - 3} more scripts {scripts.length < 20 ? 'loading and ready to view!' : 'ready to view!'}
                    </div>
                  )}

                  {/* Show loading message for remaining scripts when expanded */}
                  {showAllScripts && scripts.length < 20 && (
                    <div className="p-4 text-center text-muted-foreground border-t border-border">
                      ... and {20 - scripts.length} more scripts loading!
                    </div>
                  )}
                </>
              ) : (
                <div className="p-4 text-center text-muted-foreground">
                  <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
                  <p>Generating your first script...</p>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Part 2: Interest & Desire (The Upsell) */}
        <section className="py-16 lg:py-20">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground max-w-4xl mx-auto">
              You Have the Scripts. Now, Let&apos;s Turn Them Into <span className="text-primary">Clients</span>.
            </h2>
            <p className="mt-4 text-lg text-muted-foreground max-w-3xl mx-auto">
              Watch this 3-minute demo to see how our AI takes one of your new scripts and automatically creates, edits, and distributes a complete marketing campaign in minutes.
            </p>
            
            <div className="mt-10 max-w-4xl mx-auto">
              <div className="relative bg-card/50 backdrop-blur-sm border border-border rounded-lg p-2 shadow-xl">
                <div className="aspect-video bg-input rounded-md flex items-center justify-center">
                  <p className="text-muted-foreground">Transformo Demo Video</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Part 3: The Irresistible Offer (Action) */}
        <section className="pb-16 lg:pb-20">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-2xl mx-auto text-center">
              <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
                <Button 
                  onClick={() => window.open('https://transformo.io/pricing/', '_blank', 'noopener,noreferrer')}
                  className="w-full sm:w-auto bg-primary text-primary-foreground font-semibold py-8 px-10 rounded-md text-lg hover:opacity-90 transition-opacity shadow-lg shadow-primary/20"
                >
                  Start Your Free 7-Day Trial
                </Button>
                <Button 
                  onClick={() => window.open('https://transformo.io/demo/', '_blank', 'noopener,noreferrer')}
                  className="w-full sm:w-auto bg-secondary text-secondary-foreground font-semibold py-8 px-10 rounded-md text-lg hover:opacity-90 transition-opacity shadow-lg border border-border"
                >
                  Book a 1-on-1 Demo
                </Button>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-muted/50 border-t border-border">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 text-center text-muted-foreground text-sm">
          <p>&copy; 2025 Transformo. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}