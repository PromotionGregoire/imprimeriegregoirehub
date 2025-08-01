-- First, let's create the images in Supabase Storage (this will be handled separately)
-- Update the product image URLs to point to Supabase Storage
UPDATE products 
SET image_url = 'https://ytcrplsistsxfaxkfqqp.supabase.co/storage/v1/object/public/product-images/business-cards-standard.jpg'
WHERE product_code = 'BC-STD-001';

UPDATE products 
SET image_url = 'https://ytcrplsistsxfaxkfqqp.supabase.co/storage/v1/object/public/product-images/business-cards-premium.jpg'
WHERE product_code = 'BC-PRM-001';

UPDATE products 
SET image_url = 'https://ytcrplsistsxfaxkfqqp.supabase.co/storage/v1/object/public/product-images/business-cards-plastic.jpg'
WHERE product_code = 'BC-PLS-001';

UPDATE products 
SET image_url = 'https://ytcrplsistsxfaxkfqqp.supabase.co/storage/v1/object/public/product-images/business-cards-kraft.jpg'
WHERE product_code = 'BC-KFT-001';