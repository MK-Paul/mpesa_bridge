-- Generate test keys for existing projects that don't have them
-- Run this in Supabase SQL Editor

UPDATE projects
SET 
  test_public_key = 'pk_test_' || encode(gen_random_bytes(24), 'hex'),
  test_secret_key = 'sk_test_' || encode(gen_random_bytes(32), 'hex')
WHERE test_public_key IS NULL OR test_secret_key IS NULL;

-- Verify the update
SELECT 
  id, 
  name, 
  public_key, 
  test_public_key,
  CASE 
    WHEN test_public_key IS NULL THEN '❌ Missing'
    ELSE '✅ Has test keys'
  END as status
FROM projects;
