-- PostgreSQL schema: IT Voice / Survei Kepuasan Layanan IT PT SJR.
-- Nama opsional. Nilai per aspek disimpan sebagai JSONB agar mudah menambah pertanyaan.
CREATE TABLE IF NOT EXISTS it_sjr_responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  respondent_name VARCHAR(80),
  department VARCHAR(60) NOT NULL,
  location VARCHAR(60) NOT NULL,
  ratings JSONB NOT NULL,
  overall SMALLINT NOT NULL CHECK (overall BETWEEN 1 AND 5),
  support_level VARCHAR(40) NOT NULL,
  issues TEXT,
  improvement_priority VARCHAR(100) NOT NULL,
  suggestion TEXT
);
CREATE INDEX IF NOT EXISTS idx_it_sjr_responses_created_at ON it_sjr_responses (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_it_sjr_responses_department ON it_sjr_responses (department);
CREATE INDEX IF NOT EXISTS idx_it_sjr_responses_location ON it_sjr_responses (location);
