-- Create the product-images bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'product-images',
  'product-images', 
  true,
  52428800, -- 50MB limit
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
) ON CONFLICT (id) DO NOTHING;

-- Create policy to allow public read access
INSERT INTO storage.policies (id, bucket_id, name, roles, definition, check_definition)
VALUES (
  'product-images-public-read',
  'product-images',
  'Allow public read access to product images',
  ARRAY['public'],
  '(bucket_id = ''product-images'')',
  '(bucket_id = ''product-images'')'
) ON CONFLICT (id) DO NOTHING;