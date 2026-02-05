-- Create the clients table
CREATE TABLE IF NOT EXISTS clients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    user_id UUID DEFAULT auth.uid(), -- Optional: Link to specific admin user if needed
    name TEXT NOT NULL,
    company TEXT NOT NULL,
    platform TEXT NOT NULL, -- 'META' | 'GOOGLE' | 'TIKTOK'
    current_balance NUMERIC(10, 2) DEFAULT 0,
    daily_spend NUMERIC(10, 2) DEFAULT 0,
    currency TEXT DEFAULT 'BRL',
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    meta_account_id TEXT,
    is_synced BOOLEAN DEFAULT FALSE
);

-- Enable Row Level Security (RLS)
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;

-- Create policy to allow all operations for authenticated users (Admin)
-- Note: Since we are implementing a single-user login, we can allow authenticated access.
-- If 'anon' key is used without login, we might need 'anon' access temporarily, 
-- but since the user requested a Login screen, we should restrict to authenticated.

-- For now, to ensure the "Save" works immediately even before full Login is active, 
-- we will allow public insert/select/update. 
-- You can tighten this later to "TO authenticated" after testing Login.

CREATE POLICY "Allow public access for now" ON clients
FOR ALL USING (true) WITH CHECK (true);
