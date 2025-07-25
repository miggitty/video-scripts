'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ThemeToggle } from '@/components/theme-toggle'
import { Logo } from '@/components/logo'
import { businessTypes } from '@/lib/business-types'

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
        const { shortHash } = await response.json()
        window.location.href = `/results/${shortHash}`
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
    <div className="min-h-screen bg-background">
      {/* Header with Logo and Theme Toggle */}
      <div className="flex justify-between items-center pt-8 pb-6 max-w-6xl mx-auto px-6">
        <div className="flex-1"></div>
        <Logo width={140} height={42} />
        <div className="flex-1 flex justify-end">
          <ThemeToggle />
        </div>
      </div>

      {/* Headlines */}
      <div className="text-center max-w-4xl mx-auto px-6 pb-16">
        <h1 className="text-4xl font-bold text-foreground mb-4">
        The Top 20 Questions Your Prospects Are Asking And Your Compeitors Aren't Answering
        </h1>
        <p className="text-xl text-muted-foreground">
          In the next 30 seconds we wil deliver you the video titles and full scripts you can use to atttract new clients using video
        </p>
      </div>

      {/* Main Content */}
      <div className="max-w-md mx-auto px-6">
        <Card className="bg-card border-border shadow-lg">
          <CardHeader className="pb-6">
          </CardHeader>
        
        <CardContent className="pt-0">
          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="businessType" className="text-sm font-medium text-foreground">
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
                <Label htmlFor="businessDescription" className="text-sm font-medium text-foreground">
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
                <Label htmlFor="city" className="text-sm font-medium text-foreground">
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
                <Label htmlFor="firstName" className="text-sm font-medium text-foreground">
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
                <Label htmlFor="companyName" className="text-sm font-medium text-foreground">
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
                <Label htmlFor="email" className="text-sm font-medium text-foreground">
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

              <div className="flex justify-center pt-6 border-t border-border">
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-12 py-3 bg-primary hover:bg-primary/90 text-primary-foreground text-lg font-semibold"
                >
                  {isSubmitting ? 'Generating Your Scripts...' : 'Get My 20 Video Scripts'}
                </Button>
              </div>
            </div>
          </form>
        </CardContent>
        </Card>
      </div>
    </div>
  )
}
