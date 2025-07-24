import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { generateScripts } from '@/lib/ai-service'
import { addToGoHighLevel } from '@/lib/gohighlevel'
import { generateShortHash, validateEmail, validateInput } from '@/lib/utils'
import { generateApiLimiter } from '@/lib/rate-limiter'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: NextRequest) {
  try {
    // Apply rate limiting
    const rateLimitResult = generateApiLimiter.check(request)
    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        { 
          status: 429,
          headers: {
            'X-RateLimit-Limit': rateLimitResult.limit.toString(),
            'X-RateLimit-Remaining': rateLimitResult.remaining.toString(),
            'X-RateLimit-Reset': new Date(rateLimitResult.resetTime).toISOString()
          }
        }
      )
    }

    const formData = await request.json()
    
    // Validate and sanitize inputs
    const firstName = validateInput(formData.firstName, 50)
    const lastName = validateInput(formData.lastName, 50)
    const companyName = validateInput(formData.companyName, 100)
    const businessType = validateInput(formData.businessType, 100)
    const businessDescription = validateInput(formData.businessDescription, 2000)
    const marketingLocation = validateInput(formData.marketingLocation, 100)
    const city = validateInput(formData.city, 50)
    const country = validateInput(formData.country, 50)
    const websiteUrl = formData.websiteUrl ? validateInput(formData.websiteUrl, 200) : null
    const email = validateInput(formData.email, 254)

    // Validate required fields after sanitization
    if (!firstName || !lastName || !companyName || !businessType || 
        !businessDescription || !marketingLocation || !city || !country || !email) {
      return NextResponse.json({ error: 'All required fields must be provided and non-empty' }, { status: 400 })
    }

    // Validate email format
    if (!validateEmail(email)) {
      return NextResponse.json({ error: 'Invalid email format' }, { status: 400 })
    }

    // Generate unique short hash
    const shortHash = generateShortHash()

    // Create lead in database with sanitized inputs
    const { data: lead, error: leadError } = await supabase
      .from('leads')
      .insert({
        first_name: firstName,
        last_name: lastName,
        company_name: companyName,
        website_url: websiteUrl,
        email: email,
        business_type: businessType,
        business_description: businessDescription,
        marketing_location: marketingLocation,
        city: city,
        country: country,
        short_hash: shortHash
      })
      .select()
      .single()

    if (leadError) {
      console.error('Error creating lead:', leadError)
      return NextResponse.json({ error: 'Failed to create lead' }, { status: 500 })
    }

    // Create sanitized form data object
    const sanitizedFormData = {
      firstName,
      lastName,
      companyName,
      websiteUrl,
      email,
      businessType,
      businessDescription,
      marketingLocation,
      city,
      country
    }

    // Start background script generation process
    generateScripts(lead.id, sanitizedFormData).catch(error => {
      console.error('Error in background script generation:', error)
    })

    // Add to GoHighLevel (fire and forget)
    addToGoHighLevel(lead, sanitizedFormData).catch(error => {
      console.error('Error adding to GoHighLevel:', error)
    })

    return NextResponse.json({ shortHash })
  } catch (error) {
    console.error('Error in generate API:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}