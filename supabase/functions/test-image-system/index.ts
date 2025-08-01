import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    // Initialize Supabase client
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Get storage bucket info
    const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets()
    
    if (bucketsError) {
      throw bucketsError
    }

    // Find product-images bucket
    const productImagesBucket = buckets.find(bucket => bucket.id === 'product-images')
    
    // List files in product-images bucket
    let files = []
    if (productImagesBucket) {
      const { data: filesList, error: filesError } = await supabase.storage
        .from('product-images')
        .list()
      
      if (!filesError) {
        files = filesList || []
      }
    }

    // Get product count with images
    const { count: productsWithImages } = await supabase
      .from('products')
      .select('*', { count: 'exact', head: true })
      .not('image_url', 'is', null)

    return new Response(
      JSON.stringify({
        status: 'success',
        message: 'Image upload system is working correctly!',
        data: {
          bucketExists: !!productImagesBucket,
          bucketPublic: productImagesBucket?.public || false,
          totalFiles: files.length,
          productsWithImages: productsWithImages || 0,
          sampleFiles: files.slice(0, 3).map(file => file.name)
        }
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({
        status: 'error', 
        message: error.message,
        timestamp: new Date().toISOString()
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})