interface Lead {
  id: string
  first_name: string
  last_name: string
  company_name: string
  email: string
  city: string
  country: string
  website_url?: string
}

interface FormData {
  businessType: string
  businessDescription: string
  marketingLocation: string
  websiteUrl?: string
}

export async function addToGoHighLevel(lead: Lead, formData: FormData) {
  try {
    // Create contact in GoHighLevel
    const contactResponse = await fetch('https://services.leadconnectorhq.com/contacts/', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.GOHIGHLEVEL_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        firstName: lead.first_name,
        lastName: lead.last_name,
        email: lead.email,
        companyName: lead.company_name,
        city: lead.city,
        country: lead.country,
        source: 'Transformo AI Content Strategist',
        locationId: process.env.GOHIGHLEVEL_LOCATION_ID,
        customFields: [
          {
            key: 'business_type',
            field_value: formData.businessType
          },
          {
            key: 'business_description',
            field_value: formData.businessDescription
          },
          {
            key: 'marketing_location',
            field_value: formData.marketingLocation
          },
          {
            key: 'website_url',
            field_value: formData.websiteUrl || ''
          }
        ]
      })
    })

    if (!contactResponse.ok) {
      throw new Error(`GoHighLevel contact creation failed: ${contactResponse.status}`)
    }

    const contact = await contactResponse.json()
    const contactId = contact.contact.id

    // Update lead with GoHighLevel contact ID
    const { createClient } = await import('@supabase/supabase-js')
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    await supabase
      .from('leads')
      .update({ ghl_contact_id: contactId })
      .eq('id', lead.id)

    // Add contact to workflow
    if (process.env.GOHIGHLEVEL_WORKFLOW_ID) {
      const workflowResponse = await fetch(
        `https://services.leadconnectorhq.com/contacts/${contactId}/workflow/${process.env.GOHIGHLEVEL_WORKFLOW_ID}`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${process.env.GOHIGHLEVEL_API_KEY}`,
            'Content-Type': 'application/json'
          }
        }
      )

      if (!workflowResponse.ok) {
        console.error('Failed to add contact to workflow:', workflowResponse.status)
      } else {
        console.log('Successfully added contact to GoHighLevel workflow')
      }
    }

    console.log('Successfully added lead to GoHighLevel:', contactId)
  } catch (error) {
    console.error('Error adding to GoHighLevel:', error)
    throw error
  }
}