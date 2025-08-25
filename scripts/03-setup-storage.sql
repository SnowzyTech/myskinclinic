-- Create storage bucket for product images
INSERT INTO storage.buckets (id, name, public) VALUES ('product-images', 'product-images', true);

-- Create storage bucket for blog images
INSERT INTO storage.buckets (id, name, public) VALUES ('blog-images', 'blog-images', true);

-- Create storage bucket for treatment images
INSERT INTO storage.buckets (id, name, public) VALUES ('treatment-images', 'treatment-images', true);

-- Set up RLS policies for storage
CREATE POLICY "Public can view product images" ON storage.objects FOR SELECT USING (bucket_id = 'product-images');
CREATE POLICY "Authenticated users can upload product images" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'product-images' AND auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can update product images" ON storage.objects FOR UPDATE USING (bucket_id = 'product-images' AND auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can delete product images" ON storage.objects FOR DELETE USING (bucket_id = 'product-images' AND auth.role() = 'authenticated');

CREATE POLICY "Public can view blog images" ON storage.objects FOR SELECT USING (bucket_id = 'blog-images');
CREATE POLICY "Authenticated users can upload blog images" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'blog-images' AND auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can update blog images" ON storage.objects FOR UPDATE USING (bucket_id = 'blog-images' AND auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can delete blog images" ON storage.objects FOR DELETE USING (bucket_id = 'blog-images' AND auth.role() = 'authenticated');

CREATE POLICY "Public can view treatment images" ON storage.objects FOR SELECT USING (bucket_id = 'treatment-images');
CREATE POLICY "Authenticated users can upload treatment images" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'treatment-images' AND auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can update treatment images" ON storage.objects FOR UPDATE USING (bucket_id = 'treatment-images' AND auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can delete treatment images" ON storage.objects FOR DELETE USING (bucket_id = 'treatment-images' AND auth.role() = 'authenticated');
