-- Create dev_tickets table for auto-generated development tickets

CREATE TABLE IF NOT EXISTS dev_tickets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  issue_pattern TEXT NOT NULL, -- Pattern key for grouping similar issues
  severity TEXT NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'resolved')),
  occurrence_count INTEGER DEFAULT 1,
  examples JSONB, -- Array of example inquiries
  affected_inquiries UUID[] DEFAULT '{}', -- Array of inquiry IDs
  assigned_to UUID REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  resolved_at TIMESTAMP WITH TIME ZONE
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_dev_tickets_status ON dev_tickets(status);
CREATE INDEX IF NOT EXISTS idx_dev_tickets_severity ON dev_tickets(severity);
CREATE INDEX IF NOT EXISTS idx_dev_tickets_created_at ON dev_tickets(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_dev_tickets_assigned_to ON dev_tickets(assigned_to);

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_dev_tickets_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  IF NEW.status = 'resolved' AND OLD.status != 'resolved' THEN
    NEW.resolved_at = NOW();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_dev_tickets_updated_at
  BEFORE UPDATE ON dev_tickets
  FOR EACH ROW
  EXECUTE FUNCTION update_dev_tickets_updated_at();

-- Enable Row Level Security
ALTER TABLE dev_tickets ENABLE ROW LEVEL SECURITY;

-- RLS Policies for dev_tickets
-- All authenticated users can view tickets
CREATE POLICY "Users can view all dev tickets"
  ON dev_tickets FOR SELECT
  TO authenticated
  USING (true);

-- Only admins can create tickets
CREATE POLICY "Admins can create dev tickets"
  ON dev_tickets FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

-- Users can update tickets assigned to them, admins can update all
CREATE POLICY "Users can update their assigned tickets, admins all"
  ON dev_tickets FOR UPDATE
  TO authenticated
  USING (
    assigned_to = auth.uid()
    OR EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

-- Only admins can delete tickets
CREATE POLICY "Admins can delete dev tickets"
  ON dev_tickets FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

COMMENT ON TABLE dev_tickets IS 'Auto-generated development tickets from recurring inquiry patterns';
COMMENT ON COLUMN dev_tickets.issue_pattern IS 'Key pattern used to group similar issues';
COMMENT ON COLUMN dev_tickets.severity IS 'Severity level: low, medium, high, critical';
COMMENT ON COLUMN dev_tickets.status IS 'Current status: open, in_progress, resolved';
COMMENT ON COLUMN dev_tickets.occurrence_count IS 'Number of times this issue has been reported';
COMMENT ON COLUMN dev_tickets.examples IS 'JSON array of example inquiries with title, link, created_at';
COMMENT ON COLUMN dev_tickets.affected_inquiries IS 'Array of inquiry UUIDs related to this ticket';
