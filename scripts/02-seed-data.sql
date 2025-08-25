-- Clear existing data first to avoid duplicates
DELETE FROM order_items;
DELETE FROM orders;
DELETE FROM blog_posts;
DELETE FROM products;
DELETE FROM treatments;
DELETE FROM bookings;
DELETE FROM categories;

-- Insert categories with explicit IDs to avoid duplicates
INSERT INTO categories (id, name, description, image_url) VALUES
('550e8400-e29b-41d4-a716-446655440001', 'Cleansers', 'Gentle cleansers for all skin types', '/placeholder.svg?height=200&width=200'),
('550e8400-e29b-41d4-a716-446655440002', 'Serums', 'Targeted treatment serums', '/placeholder.svg?height=200&width=200'),
('550e8400-e29b-41d4-a716-446655440003', 'Moisturizers', 'Hydrating moisturizers and creams', '/placeholder.svg?height=200&width=200'),
('550e8400-e29b-41d4-a716-446655440004', 'Sunscreens', 'Protective sunscreen products', '/placeholder.svg?height=200&width=200'),
('550e8400-e29b-41d4-a716-446655440005', 'Masks', 'Treatment masks and exfoliants', '/placeholder.svg?height=200&width=200');

-- Insert sample products with explicit category IDs
INSERT INTO products (name, description, ingredients, price, image_url, category_id, stock_quantity) VALUES
('Gentle Foam Cleanser', 'A mild, soap-free cleanser that removes impurities without stripping the skin.', 'Water, Glycerin, Sodium Cocoyl Glutamate, Chamomile Extract', 25.99, '/placeholder.svg?height=300&width=300', '550e8400-e29b-41d4-a716-446655440001', 50),
('Vitamin C Serum', 'Brightening serum with 20% Vitamin C for radiant skin.', 'L-Ascorbic Acid, Hyaluronic Acid, Vitamin E, Ferulic Acid', 45.99, '/placeholder.svg?height=300&width=300', '550e8400-e29b-41d4-a716-446655440002', 30),
('Hydrating Night Cream', 'Rich moisturizer for overnight skin repair and hydration.', 'Ceramides, Niacinamide, Peptides, Shea Butter', 35.99, '/placeholder.svg?height=300&width=300', '550e8400-e29b-41d4-a716-446655440003', 40),
('SPF 50 Sunscreen', 'Broad-spectrum protection with lightweight formula.', 'Zinc Oxide, Titanium Dioxide, Hyaluronic Acid', 28.99, '/placeholder.svg?height=300&width=300', '550e8400-e29b-41d4-a716-446655440004', 60),
('Clay Purifying Mask', 'Deep cleansing mask for oily and acne-prone skin.', 'Bentonite Clay, Salicylic Acid, Tea Tree Oil', 22.99, '/placeholder.svg?height=300&width=300', '550e8400-e29b-41d4-a716-446655440005', 25),
('Retinol Night Serum', 'Anti-aging serum with retinol for skin renewal.', 'Retinol, Hyaluronic Acid, Vitamin E, Squalane', 52.99, '/placeholder.svg?height=300&width=300', '550e8400-e29b-41d4-a716-446655440002', 20),
('Daily Moisturizer SPF 30', 'Lightweight daily moisturizer with sun protection.', 'Hyaluronic Acid, Niacinamide, Zinc Oxide', 32.99, '/placeholder.svg?height=300&width=300', '550e8400-e29b-41d4-a716-446655440003', 35),
('Exfoliating Toner', 'Gentle exfoliating toner with AHA/BHA.', 'Glycolic Acid, Salicylic Acid, Witch Hazel', 29.99, '/placeholder.svg?height=300&width=300', '550e8400-e29b-41d4-a716-446655440001', 45);

-- Insert treatments
INSERT INTO treatments (name, description, duration, price, image_url) VALUES
('HydraFacial', 'Deep cleansing and hydrating facial treatment that removes impurities and delivers essential nutrients to the skin.', 60, 120.00, '/placeholder.svg?height=300&width=300'),
('Chemical Peel', 'Professional exfoliating treatment that removes dead skin cells and promotes skin renewal for a brighter complexion.', 45, 85.00, '/placeholder.svg?height=300&width=300'),
('Microneedling', 'Collagen induction therapy that stimulates natural skin regeneration for improved texture and reduced signs of aging.', 90, 150.00, '/placeholder.svg?height=300&width=300'),
('LED Light Therapy', 'Advanced light therapy treatment that targets acne, reduces inflammation, and promotes anti-aging benefits.', 30, 65.00, '/placeholder.svg?height=300&width=300'),
('Dermaplaning', 'Gentle exfoliation treatment that removes dead skin cells and vellus hair for smoother, brighter skin.', 45, 95.00, '/placeholder.svg?height=300&width=300'),
('Oxygen Facial', 'Rejuvenating treatment that infuses oxygen and nutrients into the skin for instant hydration and glow.', 50, 110.00, '/placeholder.svg?height=300&width=300'),
('Acne Treatment', 'Specialized treatment targeting acne-prone skin with deep cleansing and targeted therapy.', 75, 130.00, '/placeholder.svg?height=300&width=300');

-- Insert sample blog posts
INSERT INTO blog_posts (title, content, excerpt, image_url, slug, is_published) VALUES
('10 Essential Skincare Tips for Glowing Skin', 
'Achieving radiant, healthy skin doesn''t have to be complicated. Here are our top 10 tips for maintaining beautiful skin:

1. Cleanse your face twice daily with a gentle cleanser
2. Always wear sunscreen, even on cloudy days
3. Stay hydrated by drinking plenty of water
4. Get adequate sleep for skin repair and regeneration
5. Use products suitable for your skin type
6. Don''t skip moisturizer, even if you have oily skin
7. Exfoliate regularly but gently
8. Eat a balanced diet rich in antioxidants
9. Manage stress through relaxation techniques
10. Be consistent with your skincare routine

Remember, consistency is key when it comes to skincare. Start with these basics and gradually build your routine as needed.', 
'Discover the essential skincare tips that will transform your daily routine and give you the glowing skin you''ve always wanted.', 
'/placeholder.svg?height=400&width=600', 
'10-essential-skincare-tips', 
true),

('The Benefits of Regular Facials', 
'Regular professional facials are more than just a luxury - they''re an investment in your skin''s health and appearance. Here''s why you should consider making facials a regular part of your skincare routine:

Professional facials provide deep cleansing that goes beyond what you can achieve at home. Our trained aestheticians can extract impurities, unclog pores, and remove dead skin cells more effectively than daily cleansing.

Facials also provide customized treatment for your specific skin concerns. Whether you''re dealing with acne, aging, hyperpigmentation, or sensitivity, a professional can tailor the treatment to address your unique needs.

Regular facials can also help maintain healthy skin and prevent future problems. By keeping your skin clean, hydrated, and properly exfoliated, you can avoid many common skin issues before they become serious concerns.

We recommend scheduling a facial every 4-6 weeks for optimal results, though this can vary based on your skin type and concerns.', 
'Learn why incorporating regular facials into your skincare routine can make a significant difference in your skin''s health and appearance.', 
'/placeholder.svg?height=400&width=600', 
'benefits-of-regular-facials', 
true),

('Understanding Your Skin Type', 
'Knowing your skin type is the foundation of any effective skincare routine. Let''s explore the different skin types and how to identify yours:

**Normal Skin**: Balanced, not too oily or dry, with small pores and few imperfections.

**Oily Skin**: Produces excess sebum, leading to shine, enlarged pores, and potential acne.

**Dry Skin**: Lacks moisture, may feel tight, and can appear flaky or rough.

**Combination Skin**: Oily in the T-zone (forehead, nose, chin) but normal or dry elsewhere.

**Sensitive Skin**: Reacts easily to products or environmental factors, may experience redness or irritation.

To determine your skin type, wash your face with a gentle cleanser and wait an hour without applying any products. Observe how your skin feels and looks.

Once you know your skin type, you can choose products and treatments that work best for your specific needs. Remember, your skin type can change due to factors like age, hormones, climate, and lifestyle.', 
'A comprehensive guide to identifying your skin type and choosing the right products for your unique needs.', 
'/placeholder.svg?height=400&width=600', 
'understanding-your-skin-type', 
true),

('The Science Behind Anti-Aging Skincare', 
'Understanding the science behind anti-aging skincare can help you make informed decisions about your routine and treatments.

As we age, our skin undergoes several changes: collagen production decreases, cell turnover slows down, and environmental damage accumulates. This leads to fine lines, wrinkles, loss of firmness, and uneven skin tone.

Key ingredients that combat these signs of aging include:

**Retinoids**: Stimulate cell turnover and collagen production
**Vitamin C**: Provides antioxidant protection and brightens skin
**Peptides**: Support collagen synthesis and skin repair
**Hyaluronic Acid**: Provides intense hydration and plumps skin
**Niacinamide**: Improves skin texture and reduces inflammation

Professional treatments like microneedling, chemical peels, and laser therapy can also significantly improve signs of aging by stimulating the skin''s natural repair processes.

The key to effective anti-aging skincare is starting early, being consistent, and combining the right products with professional treatments.', 
'Explore the science behind effective anti-aging skincare and learn which ingredients and treatments deliver real results.', 
'/placeholder.svg?height=400&width=600', 
'science-behind-anti-aging-skincare', 
true);

-- Create a demo admin user (you'll need to create this user in Supabase Auth manually)
-- Email: admin@skinclinic.com
-- Password: admin123

-- Create a demo regular user (you'll need to create this user in Supabase Auth manually)  
-- Email: user@example.com
-- Password: password123
