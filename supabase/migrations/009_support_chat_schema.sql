-- ==============================================
-- SUPPORT CHAT SCHEMA
-- ==============================================
-- Enable pgvector extension for embeddings
CREATE EXTENSION IF NOT EXISTS vector;

-- ==============================================
-- TABLE: support_conversations
-- Stores chat conversations with AI support
-- ==============================================
CREATE TABLE support_conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Conversation metadata
  title TEXT,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'escalated', 'resolved')),

  -- Messages stored as JSON array (same pattern as sms_conversations)
  -- Format: [{id: uuid, role: 'user'|'assistant', content: string, timestamp: ISO8601}]
  messages JSONB DEFAULT '[]'::jsonb,

  -- Timestamps
  last_message_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================
-- TABLE: support_resources
-- Documentation content for RAG
-- ==============================================
CREATE TABLE support_resources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content TEXT NOT NULL,

  -- Metadata: {source: string, category: string, url: string, etc}
  metadata JSONB DEFAULT '{}'::jsonb,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================
-- TABLE: support_embeddings
-- Vector embeddings for semantic search
-- ==============================================
CREATE TABLE support_embeddings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  resource_id UUID REFERENCES support_resources(id) ON DELETE CASCADE,

  -- Text chunk content
  content TEXT NOT NULL,

  -- Vector embedding (text-embedding-3-small = 1536 dimensions)
  embedding VECTOR(1536),

  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================
-- TABLE: support_tickets
-- For human escalation
-- ==============================================
CREATE TABLE support_tickets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID REFERENCES support_conversations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Ticket data
  subject TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'resolved', 'closed')),
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),

  -- Assignment (for future admin panel)
  assigned_to UUID REFERENCES auth.users(id),

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  resolved_at TIMESTAMPTZ
);

-- ==============================================
-- TABLE: support_analytics
-- Track common questions and metrics
-- ==============================================
CREATE TABLE support_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  conversation_id UUID REFERENCES support_conversations(id) ON DELETE CASCADE,

  -- Question classification
  question_category TEXT,
  question_summary TEXT,
  was_answered BOOLEAN DEFAULT FALSE,
  was_escalated BOOLEAN DEFAULT FALSE,

  -- Response metrics
  response_time_seconds INTEGER,
  satisfaction_rating INTEGER CHECK (satisfaction_rating BETWEEN 1 AND 5),

  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================
-- INDEXES FOR PERFORMANCE
-- ==============================================

-- Support conversations indexes
CREATE INDEX idx_support_conversations_user_id ON support_conversations(user_id);
CREATE INDEX idx_support_conversations_status ON support_conversations(status);
CREATE INDEX idx_support_conversations_last_message ON support_conversations(last_message_at DESC);

-- Support tickets indexes
CREATE INDEX idx_support_tickets_user_id ON support_tickets(user_id);
CREATE INDEX idx_support_tickets_status ON support_tickets(status);
CREATE INDEX idx_support_tickets_conversation_id ON support_tickets(conversation_id);
CREATE INDEX idx_support_tickets_assigned_to ON support_tickets(assigned_to);

-- Support analytics indexes
CREATE INDEX idx_support_analytics_category ON support_analytics(question_category);
CREATE INDEX idx_support_analytics_created_at ON support_analytics(created_at DESC);
CREATE INDEX idx_support_analytics_user_id ON support_analytics(user_id);

-- Support embeddings indexes
CREATE INDEX idx_support_embeddings_resource_id ON support_embeddings(resource_id);

-- HNSW index for fast vector similarity search
-- m=16 (number of connections), ef_construction=64 (search quality during build)
CREATE INDEX idx_support_embeddings_vector ON support_embeddings
  USING hnsw (embedding vector_cosine_ops)
  WITH (m = 16, ef_construction = 64);

-- ==============================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================

-- Enable RLS on all tables
ALTER TABLE support_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE support_resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE support_embeddings ENABLE ROW LEVEL SECURITY;
ALTER TABLE support_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE support_analytics ENABLE ROW LEVEL SECURITY;

-- ==============================================
-- POLICIES: support_conversations
-- ==============================================

-- Users can view their own conversations
CREATE POLICY "Users can view own conversations"
  ON support_conversations FOR SELECT
  USING (auth.uid() = user_id);

-- Users can create their own conversations
CREATE POLICY "Users can create own conversations"
  ON support_conversations FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own conversations
CREATE POLICY "Users can update own conversations"
  ON support_conversations FOR UPDATE
  USING (auth.uid() = user_id);

-- Users can delete their own conversations
CREATE POLICY "Users can delete own conversations"
  ON support_conversations FOR DELETE
  USING (auth.uid() = user_id);

-- Admins can view all conversations
CREATE POLICY "Admins can view all conversations"
  ON support_conversations FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- ==============================================
-- POLICIES: support_resources
-- ==============================================

-- Anyone authenticated can view resources (public documentation)
CREATE POLICY "Anyone authenticated can view resources"
  ON support_resources FOR SELECT
  USING (auth.role() = 'authenticated');

-- Only admins can manage resources
CREATE POLICY "Admins can insert resources"
  ON support_resources FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Admins can update resources"
  ON support_resources FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Admins can delete resources"
  ON support_resources FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- ==============================================
-- POLICIES: support_embeddings
-- ==============================================

-- Anyone authenticated can view embeddings (for RAG search)
CREATE POLICY "Anyone authenticated can view embeddings"
  ON support_embeddings FOR SELECT
  USING (auth.role() = 'authenticated');

-- Only admins can manage embeddings
CREATE POLICY "Admins can manage embeddings"
  ON support_embeddings FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- ==============================================
-- POLICIES: support_tickets
-- ==============================================

-- Users can view their own tickets
CREATE POLICY "Users can view own tickets"
  ON support_tickets FOR SELECT
  USING (auth.uid() = user_id);

-- Users can create their own tickets
CREATE POLICY "Users can create own tickets"
  ON support_tickets FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own tickets (status, etc)
CREATE POLICY "Users can update own tickets"
  ON support_tickets FOR UPDATE
  USING (auth.uid() = user_id);

-- Admins can view all tickets
CREATE POLICY "Admins can view all tickets"
  ON support_tickets FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Admins can update all tickets (assignment, status, etc)
CREATE POLICY "Admins can update all tickets"
  ON support_tickets FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- ==============================================
-- POLICIES: support_analytics
-- ==============================================

-- Users can view their own analytics
CREATE POLICY "Users can view own analytics"
  ON support_analytics FOR SELECT
  USING (auth.uid() = user_id);

-- Admins can view all analytics
CREATE POLICY "Admins can view all analytics"
  ON support_analytics FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Service role can insert analytics (from AI API route)
CREATE POLICY "Service role can insert analytics"
  ON support_analytics FOR INSERT
  TO service_role
  WITH CHECK (true);

-- ==============================================
-- FUNCTION: match_support_embeddings
-- Vector similarity search for RAG
-- ==============================================

CREATE OR REPLACE FUNCTION match_support_embeddings(
  query_embedding VECTOR(1536),
  match_threshold FLOAT DEFAULT 0.5,
  match_count INT DEFAULT 5
)
RETURNS TABLE (
  id UUID,
  content TEXT,
  similarity FLOAT
)
LANGUAGE SQL STABLE
AS $$
  SELECT
    support_embeddings.id,
    support_embeddings.content,
    1 - (support_embeddings.embedding <=> query_embedding) AS similarity
  FROM support_embeddings
  WHERE 1 - (support_embeddings.embedding <=> query_embedding) > match_threshold
  ORDER BY support_embeddings.embedding <=> query_embedding
  LIMIT match_count;
$$;

-- ==============================================
-- UPDATE TRIGGERS
-- Auto-update updated_at timestamp
-- ==============================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to relevant tables
CREATE TRIGGER update_support_conversations_updated_at
  BEFORE UPDATE ON support_conversations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_support_resources_updated_at
  BEFORE UPDATE ON support_resources
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_support_tickets_updated_at
  BEFORE UPDATE ON support_tickets
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ==============================================
-- COMMENTS FOR DOCUMENTATION
-- ==============================================

COMMENT ON TABLE support_conversations IS 'AI support chat conversations with message history';
COMMENT ON TABLE support_resources IS 'Documentation content for RAG knowledge base';
COMMENT ON TABLE support_embeddings IS 'Vector embeddings for semantic search';
COMMENT ON TABLE support_tickets IS 'Support tickets created from escalated conversations';
COMMENT ON TABLE support_analytics IS 'Analytics tracking for common questions and metrics';

COMMENT ON FUNCTION match_support_embeddings IS 'Vector similarity search for RAG - returns most relevant content chunks';
