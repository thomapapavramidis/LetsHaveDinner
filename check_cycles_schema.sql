-- Run this in Supabase SQL Editor to see what columns actually exist
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'cycles'
  AND table_schema = 'public'
ORDER BY ordinal_position;
