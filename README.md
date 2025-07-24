# Transformo AI Content Strategist

A Next.js application that generates 20 personalized video scripts for businesses using AI. This lead magnet application is designed to attract potential customers for the Transformo video marketing platform.

## Features

- **Multi-step form** with business categorization and lead capture
- **AI-powered research** using Google Gemini to discover top customer questions
- **Script generation** following the "Endless Customers" framework
- **Real-time updates** as scripts are generated using Supabase subscriptions
- **CRM integration** with GoHighLevel for lead nurturing
- **Responsive design** built with Tailwind CSS and shadcn/ui components

## Tech Stack

- **Frontend**: Next.js 15.4.3, React 19, TypeScript
- **Styling**: Tailwind CSS 4, shadcn/ui components
- **Database**: Supabase (PostgreSQL)
- **AI**: OpenRouter API with Google Gemini 1.5 Pro
- **CRM**: GoHighLevel API integration
- **Deployment**: Vercel (recommended)

## Prerequisites

Before you begin, ensure you have:

- Node.js 18+ installed
- A Supabase account and project
- An OpenRouter API key
- A GoHighLevel account with API access (optional)

## Setup Instructions

### 1. Clone and Install

```bash
git clone <repository-url>
cd video-scripts
npm install
```

### 2. Environment Variables

Copy the example environment file and fill in your credentials:

```bash
cp .env.example .env.local
```

Required environment variables:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# OpenRouter API for Gemini AI
OPENROUTER_API_KEY=your_openrouter_api_key

# GoHighLevel CRM Integration (Optional)
GOHIGHLEVEL_API_KEY=your_gohighlevel_api_key
GOHIGHLEVEL_LOCATION_ID=your_gohighlevel_location_id
GOHIGHLEVEL_WORKFLOW_ID=your_gohighlevel_workflow_id
```

### 3. Database Setup

The database migration file is already created. Run it in your Supabase project:

1. Go to your Supabase dashboard
2. Navigate to SQL Editor
3. Run the migration file: `supabase/migrations/20250124000001_create_tables.sql`

Alternatively, if you have Supabase CLI installed:

```bash
supabase migration up
```

### 4. Development

Start the development server:

```bash
npm run dev
```

The application will be available at `http://localhost:3000`

## API Endpoints

- `POST /api/generate` - Submit form and start script generation
- `GET /api/results/[hash]` - Retrieve results by short hash

## Database Schema

### Tables

**leads**
- Stores user information and business details
- Contains a unique `short_hash` for result page URLs

**generated_scripts**
- Stores the AI-generated video scripts
- Linked to leads via `lead_id`
- Real-time updates enabled for progressive loading

## Deployment

### Vercel Deployment

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy automatically on push

### Environment Variables for Production

Make sure to set all environment variables in your production environment:

- Supabase URLs and keys
- OpenRouter API key
- GoHighLevel credentials (if using CRM integration)

## AI Integration

The application uses Google Gemini 1.5 Pro via OpenRouter for:

1. **Question Discovery**: Researching top 20 customer questions for the business
2. **Script Generation**: Creating detailed video scripts using the "Endless Customers" framework

### Script Structure

Each generated script follows this structure:
- **Teaser (QQPP Method)**: Hook with questions, promise, and preview
- **Introduction**: Presenter introduction and topic setup
- **Teaching Segments**: 2-3 educational segments with actionable advice
- **Summary**: Key points recap
- **Call to Action**: Contact information for the business

## Security Features

- Input sanitization to prevent XSS attacks
- Email format validation
- Row Level Security (RLS) policies in Supabase
- Cryptographically secure short hash generation
- Environment variable protection

## Customization

### Business Types

Modify `lib/business-types.ts` to add or change business categories and types.

### Styling

The application uses Tailwind CSS with custom CSS variables. Modify:
- `app/globals.css` for global styles and color schemes
- Component files for specific styling changes

### AI Prompts

Customize the AI prompts in `lib/ai-service.ts`:
- Question discovery prompt
- Script generation prompt with framework adjustments

## Troubleshooting

### Common Issues

1. **Environment Variables**: Ensure all required variables are set
2. **Database Connection**: Verify Supabase credentials and RLS policies
3. **API Limits**: Check OpenRouter usage and rate limits
4. **Real-time Updates**: Ensure Supabase real-time is enabled for the project

### Error Handling

The application includes comprehensive error handling:
- Retry logic for AI API calls (up to 3 attempts)
- Graceful degradation if some scripts fail to generate
- User-friendly error messages
- Detailed logging for debugging

## Support

For issues and questions:
1. Check the troubleshooting section above
2. Review the error logs in your deployment dashboard
3. Verify all environment variables are correctly set
4. Ensure database migrations have been applied

## License

This project is licensed under the MIT License.
