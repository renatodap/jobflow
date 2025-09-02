-- Simple CRM Schema for Lead Tracking
-- Designed for B2B automation sales pipeline

-- Create leads table
CREATE TABLE IF NOT EXISTS public.leads (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Basic Information
  business_name TEXT NOT NULL,
  contact_name TEXT,
  email TEXT UNIQUE NOT NULL,
  phone TEXT,
  website TEXT,
  
  -- Business Details
  industry TEXT,
  business_type TEXT CHECK (business_type IN ('cafe', 'restaurant', 'retail', 'service', 'ecommerce', 'other')),
  employee_count TEXT CHECK (employee_count IN ('1-5', '6-10', '11-25', '26-50', '50+')),
  location_city TEXT,
  location_state TEXT,
  
  -- Lead Source & Status
  source TEXT CHECK (source IN ('cold_email', 'referral', 'website', 'social', 'event', 'other')),
  source_details TEXT,
  status TEXT DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'qualified', 'proposal', 'negotiation', 'won', 'lost', 'nurture')),
  lead_score INTEGER DEFAULT 0 CHECK (lead_score >= 0 AND lead_score <= 100),
  
  -- Engagement Tracking
  emails_sent INTEGER DEFAULT 0,
  emails_opened INTEGER DEFAULT 0,
  emails_replied INTEGER DEFAULT 0,
  last_contact_date TIMESTAMPTZ,
  next_follow_up_date DATE,
  
  -- Sales Information
  product_interest TEXT[] DEFAULT '{}', -- Array of products they're interested in
  estimated_value DECIMAL(10,2),
  actual_value DECIMAL(10,2),
  close_date DATE,
  lost_reason TEXT,
  
  -- Notes & Tags
  notes TEXT,
  tags TEXT[] DEFAULT '{}',
  
  -- Social Media Presence (for research)
  instagram_handle TEXT,
  facebook_page TEXT,
  linkedin_url TEXT,
  tiktok_handle TEXT,
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id),
  assigned_to UUID REFERENCES auth.users(id)
);

-- Create interactions table for tracking all touchpoints
CREATE TABLE IF NOT EXISTS public.lead_interactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  lead_id UUID NOT NULL REFERENCES public.leads(id) ON DELETE CASCADE,
  
  interaction_type TEXT NOT NULL CHECK (interaction_type IN (
    'email_sent', 'email_opened', 'email_replied', 'email_bounced',
    'call_made', 'call_received', 'voicemail_left',
    'meeting_scheduled', 'meeting_completed', 'meeting_no_show',
    'proposal_sent', 'proposal_viewed',
    'demo_scheduled', 'demo_completed',
    'linkedin_connection', 'linkedin_message',
    'note', 'task', 'other'
  )),
  
  subject TEXT,
  content TEXT,
  email_template_used TEXT,
  
  -- Outcome tracking
  outcome TEXT CHECK (outcome IN ('positive', 'neutral', 'negative', 'pending')),
  sentiment_score DECIMAL(3,2) CHECK (sentiment_score >= -1 AND sentiment_score <= 1),
  
  -- Scheduling
  scheduled_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  duration_minutes INTEGER,
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id)
);

-- Create email templates table
CREATE TABLE IF NOT EXISTS public.email_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  name TEXT NOT NULL UNIQUE,
  subject TEXT NOT NULL,
  body TEXT NOT NULL,
  
  -- Performance metrics
  times_used INTEGER DEFAULT 0,
  opens INTEGER DEFAULT 0,
  replies INTEGER DEFAULT 0,
  meetings_booked INTEGER DEFAULT 0,
  deals_closed INTEGER DEFAULT 0,
  
  -- Calculated metrics
  open_rate DECIMAL(5,2) GENERATED ALWAYS AS (
    CASE 
      WHEN times_used > 0 THEN (opens::DECIMAL / times_used * 100)
      ELSE 0
    END
  ) STORED,
  
  reply_rate DECIMAL(5,2) GENERATED ALWAYS AS (
    CASE 
      WHEN times_used > 0 THEN (replies::DECIMAL / times_used * 100)
      ELSE 0
    END
  ) STORED,
  
  -- Configuration
  category TEXT CHECK (category IN ('cold', 'follow_up', 'nurture', 'proposal', 'closing')),
  is_active BOOLEAN DEFAULT true,
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create pipeline stages configuration
CREATE TABLE IF NOT EXISTS public.pipeline_stages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  stage_name TEXT NOT NULL UNIQUE,
  stage_order INTEGER NOT NULL,
  probability_percent INTEGER DEFAULT 0,
  
  -- Automation rules
  auto_email_template UUID REFERENCES public.email_templates(id),
  auto_follow_up_days INTEGER,
  required_fields TEXT[] DEFAULT '{}',
  
  -- Styling for UI
  color_hex TEXT DEFAULT '#808080',
  icon_name TEXT,
  
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create tasks table for follow-ups
CREATE TABLE IF NOT EXISTS public.tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  lead_id UUID REFERENCES public.leads(id) ON DELETE CASCADE,
  
  task_type TEXT CHECK (task_type IN ('call', 'email', 'meeting', 'follow_up', 'research', 'proposal', 'other')),
  title TEXT NOT NULL,
  description TEXT,
  
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'cancelled')),
  
  due_date TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  
  -- Assignment
  assigned_to UUID REFERENCES auth.users(id),
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id)
);

-- Create deals/opportunities table
CREATE TABLE IF NOT EXISTS public.deals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  lead_id UUID NOT NULL REFERENCES public.leads(id) ON DELETE CASCADE,
  
  -- Deal details
  deal_name TEXT NOT NULL,
  product_type TEXT NOT NULL,
  
  -- Pricing
  setup_fee DECIMAL(10,2),
  monthly_recurring DECIMAL(10,2),
  annual_value DECIMAL(10,2) GENERATED ALWAYS AS (monthly_recurring * 12) STORED,
  
  -- Timeline
  expected_close_date DATE,
  actual_close_date DATE,
  go_live_date DATE,
  
  -- Status
  stage TEXT DEFAULT 'qualification' CHECK (stage IN (
    'qualification', 'discovery', 'proposal', 'negotiation', 'closed_won', 'closed_lost'
  )),
  probability_percent INTEGER DEFAULT 20,
  
  -- Competition
  competitors TEXT[],
  differentiators TEXT,
  
  -- Risk assessment
  risk_level TEXT CHECK (risk_level IN ('low', 'medium', 'high')),
  risk_notes TEXT,
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  closed_at TIMESTAMPTZ,
  created_by UUID REFERENCES auth.users(id),
  owner UUID REFERENCES auth.users(id)
);

-- Create indexes for performance
CREATE INDEX idx_leads_status ON public.leads(status);
CREATE INDEX idx_leads_email ON public.leads(email);
CREATE INDEX idx_leads_next_follow_up ON public.leads(next_follow_up_date);
CREATE INDEX idx_interactions_lead_id ON public.lead_interactions(lead_id);
CREATE INDEX idx_interactions_type ON public.lead_interactions(interaction_type);
CREATE INDEX idx_tasks_due_date ON public.tasks(due_date);
CREATE INDEX idx_tasks_assigned_to ON public.tasks(assigned_to);
CREATE INDEX idx_deals_stage ON public.deals(stage);
CREATE INDEX idx_deals_lead_id ON public.deals(lead_id);

-- Enable Row Level Security
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lead_interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pipeline_stages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.deals ENABLE ROW LEVEL SECURITY;

-- Create RLS policies (basic - everyone can see everything for now)
CREATE POLICY "Enable all access for authenticated users" ON public.leads
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Enable all access for authenticated users" ON public.lead_interactions
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Enable all access for authenticated users" ON public.email_templates
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Enable all access for authenticated users" ON public.pipeline_stages
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Enable all access for authenticated users" ON public.tasks
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Enable all access for authenticated users" ON public.deals
  FOR ALL USING (auth.role() = 'authenticated');

-- Create views for reporting
CREATE OR REPLACE VIEW public.lead_stats AS
SELECT 
  status,
  COUNT(*) as count,
  AVG(lead_score) as avg_score,
  SUM(estimated_value) as pipeline_value,
  SUM(actual_value) as revenue
FROM public.leads
GROUP BY status;

CREATE OR REPLACE VIEW public.email_template_performance AS
SELECT 
  name,
  category,
  times_used,
  open_rate,
  reply_rate,
  CASE 
    WHEN times_used > 0 THEN (meetings_booked::DECIMAL / times_used * 100)
    ELSE 0
  END as meeting_rate,
  CASE 
    WHEN times_used > 0 THEN (deals_closed::DECIMAL / times_used * 100)
    ELSE 0
  END as close_rate
FROM public.email_templates
WHERE is_active = true
ORDER BY reply_rate DESC;

-- Create functions for automation
CREATE OR REPLACE FUNCTION public.update_lead_score()
RETURNS TRIGGER AS $$
BEGIN
  -- Simple scoring based on interactions
  UPDATE public.leads
  SET lead_score = LEAST(100, (
    (emails_replied * 20) +
    (CASE WHEN website IS NOT NULL THEN 10 ELSE 0 END) +
    (CASE WHEN employee_count IN ('11-25', '26-50', '50+') THEN 15 ELSE 5 END) +
    (CASE WHEN status IN ('qualified', 'proposal', 'negotiation') THEN 20 ELSE 0 END)
  ))
  WHERE id = NEW.lead_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to update lead score on interactions
CREATE TRIGGER update_lead_score_on_interaction
AFTER INSERT OR UPDATE ON public.lead_interactions
FOR EACH ROW
EXECUTE FUNCTION public.update_lead_score();

-- Create function to auto-update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER update_leads_updated_at BEFORE UPDATE ON public.leads
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_tasks_updated_at BEFORE UPDATE ON public.tasks
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_deals_updated_at BEFORE UPDATE ON public.deals
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- Insert default pipeline stages
INSERT INTO public.pipeline_stages (stage_name, stage_order, probability_percent, color_hex) VALUES
  ('New', 1, 10, '#gray'),
  ('Contacted', 2, 20, '#blue'),
  ('Qualified', 3, 30, '#yellow'),
  ('Proposal', 4, 50, '#orange'),
  ('Negotiation', 5, 75, '#purple'),
  ('Won', 6, 100, '#green'),
  ('Lost', 7, 0, '#red'),
  ('Nurture', 8, 5, '#gray')
ON CONFLICT DO NOTHING;

-- Insert email templates from our cold email templates
INSERT INTO public.email_templates (name, subject, body, category) VALUES
  ('Time Saver', 'Save 10 hours/week on your social media', 'Template body here...', 'cold'),
  ('Competitor Angle', 'How [Competitor] is winning on social', 'Template body here...', 'cold'),
  ('Problem Solution', 'Still copying Instagram posts manually?', 'Template body here...', 'cold'),
  ('ROI Focus', 'Turn 1 post into 500% more reach', 'Template body here...', 'cold'),
  ('Case Study', 'How [Local Cafe] doubled social reach', 'Template body here...', 'cold'),
  ('Direct Approach', 'I''ll automate your social media for $497', 'Template body here...', 'cold'),
  ('Pain Point', 'Tired of "we should post more"?', 'Template body here...', 'cold'),
  ('Urgency Play', '2 automation spots left for October', 'Template body here...', 'cold'),
  ('Question Hook', 'Quick question about your social media', 'Template body here...', 'cold'),
  ('Testimonial Lead', '[Mutual] said you might need this', 'Template body here...', 'cold')
ON CONFLICT DO NOTHING;