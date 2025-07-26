import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { resultsApiLimiter } from '@/lib/rate-limiter'
import { validateInput } from '@/lib/utils'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Apply rate limiting
    const rateLimitResult = resultsApiLimiter.check(request)
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

    const { id } = await params

    // Validate and sanitize id parameter  
    const sanitizedId = validateInput(id, 36)
    if (!sanitizedId) {
      return NextResponse.json({ error: 'Valid id parameter is required' }, { status: 400 })
    }

    // Fetch lead information
    const { data: lead, error: leadError } = await supabase
      .from('leads')
      .select('id, first_name, company_name')
      .eq('id', sanitizedId)
      .single()

    if (leadError || !lead) {
      return NextResponse.json({ error: 'Results not found' }, { status: 404 })
    }

    // Fetch scripts
    const { data: scripts, error: scriptsError } = await supabase
      .from('generated_scripts')
      .select('*')
      .eq('lead_id', lead.id)
      .order('order_index')

    if (scriptsError) {
      console.error('Error fetching scripts:', scriptsError)
      return NextResponse.json({ error: 'Failed to fetch scripts' }, { status: 500 })
    }

    return NextResponse.json({
      lead,
      scripts: scripts || []
    })
  } catch (error) {
    console.error('Error in results API:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}