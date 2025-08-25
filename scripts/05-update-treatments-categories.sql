-- Add treatment categories to the treatments table
ALTER TABLE treatments ADD COLUMN IF NOT EXISTS category VARCHAR(50) DEFAULT 'skin-treatment';

-- Update existing treatments with categories
UPDATE treatments SET category = 'skin-treatment' WHERE name IN ('HydraFacial', 'Chemical Peel', 'Microneedling', 'LED Light Therapy', 'Dermaplaning', 'Oxygen Facial', 'Acne Treatment');

-- Add new laser hair removal treatments
INSERT INTO treatments (name, description, duration, price, image_url, category) VALUES
('Full Body Laser Hair Removal', 'Complete laser hair removal for entire body with advanced IPL technology.', 120, 250.00, '/placeholder.svg?height=300&width=300', 'laser-hair-removal'),
('Face Laser Hair Removal', 'Precise laser hair removal for facial areas including upper lip, chin, and cheeks.', 30, 80.00, '/placeholder.svg?height=300&width=300', 'laser-hair-removal'),
('Underarm Laser Hair Removal', 'Quick and effective laser hair removal for underarm area.', 15, 45.00, '/placeholder.svg?height=300&width=300', 'laser-hair-removal'),
('Leg Laser Hair Removal', 'Comprehensive laser hair removal for full legs or half legs.', 60, 150.00, '/placeholder.svg?height=300&width=300', 'laser-hair-removal');

-- Add teeth whitening treatments
INSERT INTO treatments (name, description, duration, price, image_url, category) VALUES
('Professional Teeth Whitening', 'Advanced teeth whitening treatment for a brighter, whiter smile.', 60, 180.00, '/placeholder.svg?height=300&width=300', 'teeth-whitening'),
('Laser Teeth Whitening', 'Fast and effective laser teeth whitening for immediate results.', 45, 220.00, '/placeholder.svg?height=300&width=300', 'teeth-whitening'),
('Take-Home Whitening Kit', 'Professional-grade whitening kit for at-home use with custom trays.', 30, 120.00, '/placeholder.svg?height=300&width=300', 'teeth-whitening');

-- Create treatment_products table for recommended products
CREATE TABLE IF NOT EXISTS treatment_products (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  treatment_id UUID REFERENCES treatments(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(treatment_id, product_id)
);

-- Add some recommended products for treatments (using existing product IDs)
-- You'll need to run this after checking your actual product IDs
-- INSERT INTO treatment_products (treatment_id, product_id) 
-- SELECT t.id, p.id 
-- FROM treatments t, products p 
-- WHERE t.name = 'HydraFacial' AND p.name IN ('Gentle Foam Cleanser', 'Hydrating Night Cream');
