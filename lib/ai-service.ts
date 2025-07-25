import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

interface FormData {
  businessType: string
  businessDescription: string
  city: string
  firstName: string
  companyName: string
  email: string
}

async function callOpenRouter(prompt: string, retries = 3): Promise<string> {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'openai/gpt-4.1-mini',
          messages: [
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0.7
        })
      })

      if (!response.ok) {
        throw new Error(`OpenRouter API error: ${response.status}`)
      }

      const data = await response.json()
      return data.choices[0].message.content
    } catch (error) {
      console.error(`AI call attempt ${attempt} failed:`, error)
      if (attempt === retries) throw error
      await new Promise(resolve => setTimeout(resolve, 1000 * attempt))
    }
  }
  throw new Error('All AI call attempts failed')
}

export async function generateScripts(leadId: string, formData: FormData) {
  try {
    // Step 1: Generate the 20 video titles
    const questionPrompt = `Act as a market research expert. For a ${formData.businessType} in ${formData.city} that offers these services: ${formData.businessDescription} plus any other core services offered by this type of business, find and list the top 5 questions their potential customers are typing into Google when they are looking to purchase. The questions should be phrased as compelling video titles that are SEO optimized.

Return only a numbered list of 5 titles, one per line, in this exact format:
1. [Title]
2. [Title]
...
5. [Title]`

    const titlesResponse = await callOpenRouter(questionPrompt)
    
    // Parse the titles from the response
    const titles = titlesResponse
      .split('\n')
      .filter(line => line.match(/^\d+\./))
      .map(line => line.replace(/^\d+\.\s*/, '').trim())
      .slice(0, 5)

    if (titles.length < 5) {
      console.warn(`Only generated ${titles.length} titles instead of 5`)
    }

    // Step 2: Generate scripts for each title
    for (let i = 0; i < titles.length; i++) {
      const title = titles[i]
      const orderIndex = i + 1

      try {
        const scriptPrompt = `You are an expert YouTube scriptwriter for a ${formData.businessType} named ${formData.companyName} located in ${formData.city}. Your task is to write a high-quality, 1-2 minute video script for the title: '${title}'.

Step 1: Research. First, perform a thorough web search on the topic '${title}' to gather the most accurate, compelling, and up-to-date information. Synthesize this research to form the core teaching points for the script.

Step 2: Write the Script. Using your research, write the script. It MUST strictly follow the 'Endless Customers' YouTube script outline, which combines the QQPP Method and the Video Six framework. The script must be structured with the following distinct sections:

Teaser (QQPP Method): Start with the QQPP (Question, Question, Promise, Preview) method to create a powerful hook.
- Question 1: Ask a direct question that speaks to the viewer's pain point.
- Question 2: Ask a second, related question to confirm they are in the right place.
- Promise: State the value the viewer will get from watching the video.
- Preview: Briefly mention the key points you will cover.

Introduction: The presenter introduces themselves and the topic, setting expectations for the video. Their name is ${formData.firstName} adn they are from the company ${formData.companyName}

Teaching Segments: Break the main content into 2-3 clear, educational segments. Each segment should teach one key aspect of the topic based on your research. Use simple language and provide actionable advice.

Summary: Briefly summarize the key teaching points covered in the video.

Call to Action (CTA): End with a clear, direct call to action. Tell the viewer what to do next, referencing the business: 'For more advice on this, contact ${formData.companyName} today for a free consultation.'

When returning the script don't include any extra text or comments, just the script. So return only what the presenter will read and nothing more. Make sure there are not headings in the script or guidance on how to read it. I just want the pure script and nothing else so we can put it in a teleprompter`

        const scriptBody = await callOpenRouter(scriptPrompt)

        // Save script to database
        const { error: scriptError } = await supabase
          .from('generated_scripts')
          .insert({
            lead_id: leadId,
            title: title,
            script_body: scriptBody,
            order_index: orderIndex
          })

        if (scriptError) {
          console.error(`Error saving script ${orderIndex}:`, scriptError)
        } else {
          console.log(`Successfully generated and saved script ${orderIndex}: ${title}`)
        }

        // Small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 100))
      } catch (error) {
        console.error(`Error generating script for title "${title}":`, error)
        
        // Save a placeholder script if generation fails
        await supabase
          .from('generated_scripts')
          .insert({
            lead_id: leadId,
            title: title,
            script_body: 'Script generation failed. Please contact support.',
            order_index: orderIndex
          })
      }
    }
  } catch (error) {
    console.error('Error in generateScripts:', error)
    throw error
  }
}