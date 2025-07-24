-- Create leads table
CREATE TABLE leads (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at timestamptz NOT NULL DEFAULT now(),
    first_name text,
    last_name text,
    company_name text,
    website_url text,
    email text NOT NULL,
    business_type text,
    business_description text,
    marketing_location text,
    city text,
    country text,
    short_hash text UNIQUE,
    ghl_contact_id text
);

-- Create generated_scripts table
CREATE TABLE generated_scripts (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    lead_id uuid NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
    title text NOT NULL,
    script_body text NOT NULL,
    order_index integer NOT NULL,
    created_at timestamptz NOT NULL DEFAULT now()
);

-- Create indexes for better performance
CREATE INDEX idx_leads_short_hash ON leads(short_hash);
CREATE INDEX idx_leads_email ON leads(email);
CREATE INDEX idx_generated_scripts_lead_id ON generated_scripts(lead_id);
CREATE INDEX idx_generated_scripts_order ON generated_scripts(lead_id, order_index);

-- Enable Row Level Security
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE generated_scripts ENABLE ROW LEVEL SECURITY;

-- Create RLS policies (allow public read access for the lead magnet functionality)
CREATE POLICY "Allow public access to leads" ON leads
    FOR ALL USING (true);

CREATE POLICY "Allow public access to generated_scripts" ON generated_scripts
    FOR ALL USING (true);

-- Enable real-time for progressive loading
ALTER PUBLICATION supabase_realtime ADD TABLE generated_scripts;