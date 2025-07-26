'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ThemeToggle } from '@/components/theme-toggle'
import { Logo } from '@/components/logo'
import { businessTypes } from '@/lib/business-types'
import { X } from 'lucide-react'
import Image from 'next/image'

interface FormData {
  businessType: string
  businessDescription: string
  city: string
  firstName: string
  companyName: string
  email: string
}

interface FormErrors {
  businessType?: string
  businessDescription?: string
  city?: string
  firstName?: string
  companyName?: string
  email?: string
}

export default function LandingPage() {
  const [formData, setFormData] = useState<FormData>({
    businessType: '',
    businessDescription: '',
    city: '',
    firstName: '',
    companyName: '',
    email: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState<FormErrors>({})
  const [showErrors, setShowErrors] = useState(false)
  const [showModal, setShowModal] = useState(false)

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // Don't clear errors individually - let them see all errors until form is valid
  }

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {}
    
    if (!formData.businessType.trim()) {
      newErrors.businessType = 'Please select your business type'
    }
    
    if (!formData.businessDescription.trim()) {
      newErrors.businessDescription = 'Please describe your services or products'
    }
    
    if (!formData.city.trim()) {
      newErrors.city = 'Please enter your city'
    }
    
    if (!formData.firstName.trim()) {
      newErrors.firstName = 'Please enter your first name'
    }
    
    if (!formData.companyName.trim()) {
      newErrors.companyName = 'Please enter your company name'
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'Please enter your email address'
    } else if (!validateEmail(formData.email)) {
      newErrors.email = 'Please enter a valid email address'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      setShowErrors(true)
      return
    }
    
    setIsSubmitting(true)

    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        const { id } = await response.json()
        window.location.href = `/results/${id}`
      } else {
        throw new Error('Failed to submit form')
      }
    } catch (error) {
      console.error('Error submitting form:', error)
      alert('Something went wrong. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-background font-sans antialiased">
      {/* Header */}
      <header className="absolute top-0 left-0 w-full z-10 py-4 px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center space-x-2">
            <Logo width={140} height={42} />
          </div>
          <ThemeToggle />
        </div>
      </header>

      <main>
        {/* Hero Section */}
        <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-28 overflow-hidden">
          <div className="absolute inset-0 bg-grid-pattern opacity-5 dark:opacity-[0.02]"></div>
          <div className="absolute top-0 left-0 -translate-x-1/3 -translate-y-1/3 w-96 h-96 bg-primary/10 rounded-full blur-3xl -z-10"></div>
          <div className="absolute bottom-0 right-0 translate-x-1/3 translate-y-1/3 w-96 h-96 bg-accent/20 rounded-full blur-3xl -z-10"></div>
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <p className="text-sm font-semibold text-primary uppercase tracking-wider mb-4">Video Script Generator</p>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-normal text-foreground leading-none max-w-4xl mx-auto">
              Stop Guessing What to Say on Camera. Get <span className="text-primary">20 AI-Generated Video Scripts</span>, Absolutely Free.
            </h1>
            <p className="mt-6 text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
              Finally, a tool that tells you exactly what your customers are asking. Generate instant, high-converting video topics and scripts for your business, and start attracting new clients with video today.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row justify-center items-center gap-4 relative z-10">
              <Button 
                type="button"
                onClick={() => {
                  console.log('Hero button clicked - opening modal');
                  setShowModal(true);
                }}
                className="w-full sm:w-auto bg-primary text-primary-foreground font-semibold py-8 px-10 rounded-md text-lg hover:opacity-90 transition-opacity shadow-lg shadow-primary/20 relative z-20"
              >
                Get My 20 Free Video Scripts Now
              </Button>
            </div>
            <div className="mt-12 relative max-w-4xl mx-auto">
              <div className="absolute -inset-2 bg-gradient-to-r from-primary to-accent rounded-lg blur opacity-25"></div>
              <div className="relative bg-card/50 backdrop-blur-sm border border-border rounded-lg p-2 shadow-xl">
                <Image src="https://placehold.co/1200x600/1a1a1a/ffffff?text=Tool+in+Action" alt="A visual of the Transformo tool generating video scripts" className="rounded-md w-full h-auto" width={1200} height={600} />
              </div>
            </div>
          </div>
        </section>

        {/* Problem/Agitation Section */}
        <section className="py-20 lg:py-28 bg-muted/50 dark:bg-card">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto">
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground">
                Want to Grow Your Business with Video, But Don&apos;t Know Where to Start?
              </h2>
              <p className="mt-4 text-lg text-muted-foreground">
                You&apos;re not alone. Thousands of business owners know they should be using video, but are stopped by four major roadblocks:
              </p>
            </div>
            <div className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {/* Roadblock 1 */}
              <div className="bg-card border border-border p-6 rounded-lg shadow-sm">
                <div className="flex items-center justify-center h-12 w-12 rounded-md bg-primary/10 text-primary mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22h6a2 2 0 0 0 2-2V7l-5-5H6a2 2 0 0 0-2 2v5"></path><path d="M14 2v4a2 2 0 0 0 2 2h4"></path><path d="M2 15.01V15"></path><path d="M2 18v.01"></path><path d="M2 21v.01"></path><path d="M7 15v.01"></path><path d="M7 18v.01"></path><path d="M7 21v.01"></path></svg>
                </div>
                <h3 className="text-lg font-semibold text-card-foreground">The &ldquo;Blank Page&rdquo; Problem</h3>
                <p className="mt-2 text-muted-foreground">You don&apos;t know what topics will attract clients or what to actually say in your videos.</p>
              </div>
              {/* Roadblock 2 */}
              <div className="bg-card border border-border p-6 rounded-lg shadow-sm">
                <div className="flex items-center justify-center h-12 w-12 rounded-md bg-primary/10 text-primary mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"></path><circle cx="12" cy="13" r="3"></circle></svg>
                </div>
                <h3 className="text-lg font-semibold text-card-foreground">The &ldquo;Tech Nightmare&rdquo;</h3>
                <p className="mt-2 text-muted-foreground">You&apos;re not sure how to record and edit your videos to look professional without spending a fortune.</p>
              </div>
              {/* Roadblock 3 */}
              <div className="bg-card border border-border p-6 rounded-lg shadow-sm">
                <div className="flex items-center justify-center h-12 w-12 rounded-md bg-primary/10 text-primary mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                </div>
                <h3 className="text-lg font-semibold text-card-foreground">The &ldquo;Time Suck&rdquo;</h3>
                <p className="mt-2 text-muted-foreground">You&apos;re already busy. How can you find the time to create and edit high-quality videos consistently?</p>
              </div>
              {/* Roadblock 4 */}
              <div className="bg-card border border-border p-6 rounded-lg shadow-sm">
                <div className="flex items-center justify-center h-12 w-12 rounded-md bg-primary/10 text-primary mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m5 12 7-7 7 7"></path><path d="M12 19V5"></path></svg>
                </div>
                <h3 className="text-lg font-semibold text-card-foreground">The &ldquo;What Now?&rdquo;</h3>
                <p className="mt-2 text-muted-foreground">You don&apos;t know how to promote it effectively to get seen by the right people and turn views into clients.</p>
              </div>
            </div>
            <div className="mt-16 text-center">
              <Button 
                onClick={() => setShowModal(true)}
                className="inline-flex items-center justify-center bg-primary text-primary-foreground font-semibold py-8 px-10 rounded-md text-lg hover:opacity-90 transition-opacity shadow-lg shadow-primary/20"
              >
                Solve My &ldquo;Blank Page&rdquo; Problem Now
              </Button>
            </div>
          </div>
        </section>

        {/* Solution Section */}
        <section className="py-20 lg:py-28">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div className="text-center lg:text-left">
                <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground">
                  Let&apos;s Solve the First Problem, Right Now, for <span className="text-primary">Free</span>.
                </h2>
                <p className="mt-4 text-lg text-muted-foreground">
                  The journey to growing your business with video starts with a single step: knowing what to say. Our free AI-powered tool instantly generates 20 video titles and full scripts based on the questions your ideal customers are searching for online.
                </p>
                <ul className="mt-8 space-y-4 text-left">
                  <li className="flex items-start">
                    <svg className="flex-shrink-0 h-6 w-6 text-primary mt-1 mr-3" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                    <span><strong className="text-foreground">No more guesswork.</strong> Get topics that are proven to attract your target audience.</span>
                  </li>
                  <li className="flex items-start">
                    <svg className="flex-shrink-0 h-6 w-6 text-primary mt-1 mr-3" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                    <span><strong className="text-foreground">No more writer&apos;s block.</strong> Receive full, word-for-word scripts you can use immediately.</span>
                  </li>
                  <li className="flex items-start">
                    <svg className="flex-shrink-0 h-6 w-6 text-primary mt-1 mr-3" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                    <span><strong className="text-foreground">Instant value.</strong> In the next 30 seconds, you can have a list of compelling video ideas ready to go.</span>
                  </li>
                </ul>
              </div>
              <div className="bg-card border border-border rounded-lg p-8 shadow-lg">
                <Image src="https://placehold.co/600x400/1a1a1a/ffffff?text=Script+Example" alt="An example of a generated video script" className="rounded-md w-full h-auto" width={600} height={400} />
                <p className="mt-4 text-center text-sm text-muted-foreground">This is the first, most crucial step to creating videos that get results. And we&apos;re giving it to you for free.</p>
              </div>
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section className="py-20 lg:py-28 bg-muted/50 dark:bg-card">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto">
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground">
                Get Your Custom Video Scripts in 3 Simple Steps
              </h2>
            </div>
            <div className="max-w-4xl mx-auto mt-12 grid lg:grid-cols-2 gap-12 items-center">
              {/* Steps */}
              <div className="space-y-8">
                <div className="flex items-start">
                  <div className="flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-primary text-primary-foreground font-bold text-xl">1</div>
                  <div className="ml-4">
                    <h3 className="text-lg font-semibold text-foreground">Tell Us About Your Business</h3>
                    <p className="mt-1 text-muted-foreground">Enter your industry and a brief description of what you do.</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-primary text-primary-foreground font-bold text-xl">2</div>
                  <div className="ml-4">
                    <h3 className="text-lg font-semibold text-foreground">Enter Your Details</h3>
                    <p className="mt-1 text-muted-foreground">Let us know where to send your free scripts.</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-primary text-primary-foreground font-bold text-xl">3</div>
                  <div className="ml-4">
                    <h3 className="text-lg font-semibold text-foreground">Get Your Scripts Instantly</h3>
                    <p className="mt-1 text-muted-foreground">Receive 20 custom video titles and scripts, ready to use.</p>
                  </div>
                </div>
              </div>
              {/* CTA Button */}
              <div className="bg-card border border-border p-8 rounded-lg shadow-xl text-center">
                <h3 className="text-2xl font-bold text-foreground mb-4">Ready to Get Started?</h3>
                <p className="text-muted-foreground mb-6">Click below to access our simple 3-step form and get your free video scripts in minutes.</p>
                <Button 
                  onClick={() => setShowModal(true)}
                  className="w-full flex justify-center py-8 px-6 border border-transparent rounded-md shadow-sm text-lg font-semibold text-primary-foreground bg-primary hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-ring"
                >
                  Generate My Free Scripts
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Value Proposition/Future Pacing Section */}
        <section className="py-20 lg:py-28">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto">
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground">
                Your First Step to a Complete Video Marketing Campaign
              </h2>
              <p className="mt-4 text-lg text-muted-foreground">
                Getting your free scripts is just the beginning. Once you know what to say, imagine if you could:
              </p>
            </div>
            <div className="mt-12 max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
              <div className="flex flex-col items-center">
                <div className="flex items-center justify-center h-16 w-16 rounded-full bg-primary/10 text-primary mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><circle cx="12" cy="10" r="3"></circle><path d="M7 20.662V19a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v1.662"></path></svg>
                </div>
                <h3 className="font-semibold text-foreground">Create videos without being on camera?</h3>
                <p className="text-muted-foreground mt-1">Use our AI avatar to record the video for you.</p>
              </div>
              <div className="flex flex-col items-center">
                <div className="flex items-center justify-center h-16 w-16 rounded-full bg-primary/10 text-primary mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m18 1-6 4-6-4"></path><path d="m18 23-6-4-6 4"></path><path d="m12 12 6 4-6 4-6-4 6-4Z"></path><path d="M6 9v4"></path><path d="M18 9v4"></path></svg>
                </div>
                <h3 className="font-semibold text-foreground">Have it professionally edited automatically?</h3>
                <p className="text-muted-foreground mt-1">No more complicated editing software.</p>
              </div>
              <div className="flex flex-col items-center">
                <div className="flex items-center justify-center h-16 w-16 rounded-full bg-primary/10 text-primary mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10 17a5 5 0 0 1-5-5V7a5 5 0 0 1 5-5h1a5 5 0 0 1 5 5v2a5 5 0 0 1-5 5h-1Z"></path><path d="M21 17a5 5 0 0 1-5-5V7a5 5 0 0 1 5-5h1a5 5 0 0 1 5 5v2a5 5 0 0 1-5 5h-1Z"></path></svg>
                </div>
                <h3 className="font-semibold text-foreground">Instantly promote your video everywhere?</h3>
                <p className="text-muted-foreground mt-1">Turn one video into a blog post, email, and social content.</p>
              </div>
            </div>
            <div className="mt-12 text-center">
              <p className="text-xl font-medium text-foreground">That&apos;s the power of Transformo. But it all starts with taking the first step.</p>
            </div>
            <div className="mt-12 text-center">
              <Button 
                onClick={() => setShowModal(true)}
                className="inline-flex items-center justify-center bg-primary text-primary-foreground font-semibold py-8 px-10 rounded-md text-lg hover:opacity-90 transition-opacity shadow-lg shadow-primary/20"
              >
                Take The First Step
              </Button>
            </div>
          </div>
        </section>

        {/* Final Call to Action Section */}
        <section className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-24 text-center">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
              Ready to Finally Start Using Video to Grow Your Business?
            </h2>
            <p className="mt-4 text-lg max-w-3xl mx-auto text-white/80">
              Stop letting the &ldquo;what to say&rdquo; problem hold you back. Take the first, easiest step today. Get your 20 free, high-converting video scripts and see for yourself how simple it can be.
            </p>
            <div className="mt-10">
              <Button 
                onClick={() => setShowModal(true)}
                className="bg-white text-gray-900 font-semibold py-8 px-10 rounded-md text-lg hover:bg-gray-100 transition-colors shadow-2xl"
              >
                Get My 20 Free Video Scripts Now
              </Button>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-muted/50 dark:bg-card">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 text-center text-muted-foreground text-sm">
          <p>&copy; 2025 Transformo. All rights reserved.</p>
        </div>
      </footer>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-card border border-border rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-6 border-b border-border">
              <h3 className="text-lg font-semibold text-card-foreground">Get Your Free Video Scripts</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowModal(false)}
                className="h-6 w-6 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="p-6">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="businessType" className="text-sm font-medium text-card-foreground">
                    Business Type/Industry *
                  </Label>
                  <div className="relative">
                    <Select value={formData.businessType} onValueChange={(value) => handleInputChange('businessType', value)}>
                      <SelectTrigger className={`bg-input border-border text-foreground transition-all duration-200 ${showErrors && errors.businessType ? 'ring-2 ring-red-200 border-red-300 focus:ring-red-300' : 'focus:ring-2 focus:ring-blue-200 focus:border-blue-400'}`}>
                        <SelectValue placeholder="Select your business type" />
                      </SelectTrigger>
                      <SelectContent className="max-h-60 bg-popover border-border">
                        {Object.entries(businessTypes).map(([category, types]) => (
                          <div key={category}>
                            <div className="px-2 py-1 text-sm font-semibold text-muted-foreground bg-muted">
                              {category}
                            </div>
                            {types.map((type) => (
                              <SelectItem key={type} value={type} className="text-foreground hover:bg-accent">
                                {type}
                              </SelectItem>
                            ))}
                          </div>
                        ))}
                      </SelectContent>
                    </Select>
                    {showErrors && errors.businessType && (
                      <p className="text-red-600 text-sm mt-1">{errors.businessType}</p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="businessDescription" className="text-sm font-medium text-card-foreground">
                    Business Description *
                  </Label>
                  <div className="relative">
                    <Textarea
                      id="businessDescription"
                      placeholder="Enter your services or products so that we can generate video scripts on those topics"
                      value={formData.businessDescription}
                      onChange={(e) => handleInputChange('businessDescription', e.target.value)}
                      rows={4}
                      className={`bg-input border-border text-foreground placeholder:text-gray-400 transition-all duration-200 ${showErrors && errors.businessDescription ? 'ring-2 ring-red-200 border-red-300 focus:ring-red-300' : 'focus:ring-2 focus:ring-blue-200 focus:border-blue-400'}`}
                    />
                    {showErrors && errors.businessDescription && (
                      <p className="text-red-600 text-sm mt-1">{errors.businessDescription}</p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="city" className="text-sm font-medium text-card-foreground">
                    City *
                  </Label>
                  <div className="relative">
                    <Input
                      id="city"
                      placeholder="Your primary city"
                      value={formData.city}
                      onChange={(e) => handleInputChange('city', e.target.value)}
                      className={`bg-input border-border text-foreground placeholder:text-gray-400 transition-all duration-200 ${showErrors && errors.city ? 'ring-2 ring-red-200 border-red-300 focus:ring-red-300' : 'focus:ring-2 focus:ring-blue-200 focus:border-blue-400'}`}
                    />
                    {showErrors && errors.city && (
                      <p className="text-red-600 text-sm mt-1">{errors.city}</p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="firstName" className="text-sm font-medium text-card-foreground">
                    First Name *
                  </Label>
                  <div className="relative">
                    <Input
                      id="firstName"
                      placeholder="Your first name"
                      value={formData.firstName}
                      onChange={(e) => handleInputChange('firstName', e.target.value)}
                      className={`bg-input border-border text-foreground placeholder:text-gray-400 transition-all duration-200 ${showErrors && errors.firstName ? 'ring-2 ring-red-200 border-red-300 focus:ring-red-300' : 'focus:ring-2 focus:ring-blue-200 focus:border-blue-400'}`}
                    />
                    {showErrors && errors.firstName && (
                      <p className="text-red-600 text-sm mt-1">{errors.firstName}</p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="companyName" className="text-sm font-medium text-card-foreground">
                    Company Name *
                  </Label>
                  <div className="relative">
                    <Input
                      id="companyName"
                      placeholder="Your company name"
                      value={formData.companyName}
                      onChange={(e) => handleInputChange('companyName', e.target.value)}
                      className={`bg-input border-border text-foreground placeholder:text-gray-400 transition-all duration-200 ${showErrors && errors.companyName ? 'ring-2 ring-red-200 border-red-300 focus:ring-red-300' : 'focus:ring-2 focus:ring-blue-200 focus:border-blue-400'}`}
                    />
                    {showErrors && errors.companyName && (
                      <p className="text-red-600 text-sm mt-1">{errors.companyName}</p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium text-card-foreground">
                    Email Address *
                  </Label>
                  <div className="relative">
                    <Input
                      id="email"
                      type="email"
                      placeholder="your@email.com"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      className={`bg-input border-border text-foreground placeholder:text-gray-400 transition-all duration-200 ${showErrors && errors.email ? 'ring-2 ring-red-200 border-red-300 focus:ring-red-300' : 'focus:ring-2 focus:ring-blue-200 focus:border-blue-400'}`}
                    />
                    {showErrors && errors.email && (
                      <p className="text-red-600 text-sm mt-1">{errors.email}</p>
                    )}
                  </div>
                </div>

                <div className="pt-4">
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full px-6 py-8 bg-primary hover:bg-primary/90 text-primary-foreground text-lg font-semibold"
                  >
                    {isSubmitting ? 'Generating Your Scripts...' : 'Get My 20 Video Scripts'}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
