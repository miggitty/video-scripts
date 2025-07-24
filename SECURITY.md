# Security Guidelines

## Environment Variables

### Critical Security Notes

1. **NEVER commit real API keys to version control**
2. **Use `.env.local` for local development only**
3. **Regenerate any exposed API keys immediately**

### Required Environment Variables

Copy `.env.example` to `.env.local` and fill in your actual values:

```bash
cp .env.example .env.local
```

### Production Deployment

For production environments (Vercel, etc.):

1. Set environment variables in your deployment platform's dashboard
2. Never use `NEXT_PUBLIC_` prefix for sensitive data
3. Only use `NEXT_PUBLIC_` for data that's safe to expose to browsers

### API Key Security

- **OpenRouter API Key**: Server-side only, never exposed to client
- **Supabase Service Role Key**: Server-side only, for admin operations
- **Supabase Anon Key**: Client-safe, used for browser connections
- **GoHighLevel Keys**: Server-side only, for CRM integration

## Database Security

### Row Level Security (RLS)

The application uses PostgreSQL Row Level Security with hash-based access control:

- Users can only access their own data via unique hash URLs
- No direct database access from client-side code
- All database operations go through secured API routes

### Hash Security

- Access hashes are 16 bytes (128 bits) of cryptographic randomness
- Practically impossible to guess or brute force
- Each lead gets a unique, unguessable hash for access control

## API Security

### Rate Limiting

- **Generate API**: 5 requests per 15 minutes per IP
- **Results API**: 60 requests per minute per IP
- Rate limits include proper HTTP headers for client handling

### Input Validation

All user inputs are:
- Type validated
- Length limited
- HTML entity encoded
- Null byte filtered
- Trimmed of whitespace

### Authentication

- No user accounts required (by design)
- Access control via cryptographic hashes
- Service operations use Supabase service role authentication

## Security Headers

The application includes comprehensive security headers:
- `X-Frame-Options: DENY` - Prevents clickjacking
- `X-Content-Type-Options: nosniff` - Prevents MIME sniffing
- `Referrer-Policy: strict-origin-when-cross-origin` - Limits referrer leakage
- `X-XSS-Protection: 1; mode=block` - Browser XSS protection
- `Permissions-Policy` - Restricts browser APIs

## Monitoring

### What to Monitor

- Unusual API usage patterns
- High rate limit triggers
- Database connection anomalies
- Failed authentication attempts (if implementing user accounts)

### Logging

- Errors are logged without sensitive data
- Access patterns are tracked for security analysis
- Rate limit violations are logged

## Incident Response

If you suspect a security incident:

1. **Immediate**: Rotate all API keys
2. **Review**: Check logs for unusual patterns
3. **Update**: Apply any pending security patches
4. **Monitor**: Increase monitoring for 24-48 hours

## Security Updates

- Keep dependencies updated regularly
- Monitor security advisories for Next.js, Supabase, and other dependencies
- Test security configurations after updates

## Deployment Security

### Vercel (Recommended)

- Use environment variables dashboard for secrets
- Enable Vercel's built-in DDoS protection
- Consider Vercel Pro for enhanced security features

### Other Platforms

- Ensure HTTPS is enforced
- Use platform-specific secret management
- Configure appropriate CORS policies
- Enable request logging and monitoring