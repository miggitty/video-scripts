interface Lead {
  id: string
  first_name: string
  company_name: string
  email: string
  city: string
}

interface FormData {
  firstName: string
  companyName: string
  email: string
  businessType: string
  businessDescription: string
  city: string
}

export async function addToGoHighLevel(lead: Lead, formData: FormData) {
  try {
    // Check if GoHighLevel integration is configured
    if (!process.env.GOHIGHLEVEL_API_KEY || !process.env.GOHIGHLEVEL_LOCATION_ID) {
      console.log('GoHighLevel integration not configured - skipping')
      return
    }

    // Create contact in GoHighLevel
    const contactResponse = await fetch('https://services.leadconnectorhq.com/contacts/', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.GOHIGHLEVEL_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        firstName: lead.first_name,
        lastName: '', // Default empty since we don't collect last name
        email: lead.email,
        companyName: lead.company_name,
        city: lead.city,
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
          }
        ]
      })
    })

    if (!contactResponse.ok) {
      const errorText = await contactResponse.text()
      console.error('GoHighLevel API Error Response:', {
        status: contactResponse.status,
        statusText: contactResponse.statusText,
        body: errorText,
        headers: Object.fromEntries(contactResponse.headers.entries())
      })
      throw new Error(`GoHighLevel contact creation failed: ${contactResponse.status} - ${errorText}`)
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
    // Don't throw error to prevent breaking the main flow
    // GoHighLevel integration failure shouldn't stop script generation
  }
}