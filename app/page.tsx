'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { businessTypes } from '@/lib/business-types'

interface FormData {
  businessType: string
  businessDescription: string
  marketingLocation: string
  city: string
  country: string
  websiteUrl: string
  firstName: string
  lastName: string
  companyName: string
  email: string
}

export default function LandingPage() {
  const [formData, setFormData] = useState<FormData>({
    businessType: '',
    businessDescription: '',
    marketingLocation: '',
    city: '',
    country: '',
    websiteUrl: '',
    firstName: '',
    lastName: '',
    companyName: '',
    email: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [step, setStep] = useState(1)

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleNext = () => {
    setStep(2)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold text-gray-900">
            Get 20 Personalized Video Scripts for Your Business
          </CardTitle>
          <CardDescription className="text-lg text-gray-600 mt-2">
            Our AI will research your industry and create compelling video scripts that attract real customers
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {step === 1 && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="businessType" className="text-sm font-medium">
                    Business Type/Industry *
                  </Label>
                  <Select value={formData.businessType} onValueChange={(value) => handleInputChange('businessType', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select your business type" />
                    </SelectTrigger>
                    <SelectContent className="max-h-60">
                      {Object.entries(businessTypes).map(([category, types]) => (
                        <div key={category}>
                          <div className="px-2 py-1 text-sm font-semibold text-gray-500 bg-gray-50">
                            {category}
                          </div>
                          {types.map((type) => (
                            <SelectItem key={type} value={type}>
                              {type}
                            </SelectItem>
                          ))}
                        </div>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="businessDescription" className="text-sm font-medium">
                    Business Description *
                  </Label>
                  <Textarea
                    id="businessDescription"
                    placeholder="Describe your specialization and key services..."
                    value={formData.businessDescription}
                    onChange={(e) => handleInputChange('businessDescription', e.target.value)}
                    rows={4}
                    required
                  />
                </div>

                <div className="space-y-3">
                  <Label className="text-sm font-medium">Marketing Location *</Label>
                  <RadioGroup
                    value={formData.marketingLocation}
                    onValueChange={(value) => handleInputChange('marketingLocation', value)}
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="Local" id="local" />
                      <Label htmlFor="local">Local</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="State Wide" id="statewide" />
                      <Label htmlFor="statewide">State Wide</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="National" id="national" />
                      <Label htmlFor="national">National</Label>
                    </div>
                  </RadioGroup>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="city" className="text-sm font-medium">
                      City *
                    </Label>
                    <Input
                      id="city"
                      placeholder="Your primary city"
                      value={formData.city}
                      onChange={(e) => handleInputChange('city', e.target.value)}
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="country" className="text-sm font-medium">
                      Country *
                    </Label>
                    <Input
                      id="country"
                      placeholder="Your country"
                      value={formData.country}
                      onChange={(e) => handleInputChange('country', e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="websiteUrl" className="text-sm font-medium">
                    Website URL (Optional)
                  </Label>
                  <Input
                    id="websiteUrl"
                    type="url"
                    placeholder="https://yourwebsite.com"
                    value={formData.websiteUrl}
                    onChange={(e) => handleInputChange('websiteUrl', e.target.value)}
                  />
                </div>

                <Button
                  type="button"
                  onClick={handleNext}
                  className="w-full"
                  disabled={!formData.businessType || !formData.businessDescription || !formData.marketingLocation || !formData.city || !formData.country}
                >
                  Continue
                </Button>
              </>
            )}

            {step === 2 && (
              <>
                <div className="text-center mb-6">
                  <h3 className="text-xl font-semibold text-gray-900">
                    Almost done! Just need your details to deliver your scripts.
                  </h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName" className="text-sm font-medium">
                      First Name *
                    </Label>
                    <Input
                      id="firstName"
                      placeholder="Your first name"
                      value={formData.firstName}
                      onChange={(e) => handleInputChange('firstName', e.target.value)}
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="lastName" className="text-sm font-medium">
                      Last Name *
                    </Label>
                    <Input
                      id="lastName"
                      placeholder="Your last name"
                      value={formData.lastName}
                      onChange={(e) => handleInputChange('lastName', e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="companyName" className="text-sm font-medium">
                    Company Name *
                  </Label>
                  <Input
                    id="companyName"
                    placeholder="Your company name"
                    value={formData.companyName}
                    onChange={(e) => handleInputChange('companyName', e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium">
                    Email Address *
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="your@email.com"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    required
                  />
                </div>

                <div className="flex gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setStep(1)}
                    className="flex-1"
                  >
                    Back
                  </Button>
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1"
                  >
                    {isSubmitting ? 'Generating Your Scripts...' : 'Get My 20 Video Scripts'}
                  </Button>
                </div>
              </>
            )}
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
