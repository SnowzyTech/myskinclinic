-- First, let's clear existing categories and create the new structure
DELETE FROM categories;

-- Insert main categories with subgroups
INSERT INTO categories (id, name, parent_id, created_at) VALUES
-- Main Category 1: Facial Care Products
(1, 'Facial Care Products', NULL, NOW()),
(2, 'Sunscreen', 1, NOW()),
(3, 'Face Wash', 1, NOW()),
(4, 'Face Cream', 1, NOW()),
(5, 'Moisturizers', 1, NOW()),
(6, 'Anti Aging Toners', 1, NOW()),
(7, 'Anti-aging Serums', 1, NOW()),

-- Main Category 2: Body Care
(8, 'Body Care', NULL, NOW()),
(9, 'Anti Aging Body Lotions', 8, NOW()),
(10, 'Body Sunscreen', 8, NOW()),
(11, 'Body Wash and Soaps', 8, NOW()),
(12, 'Body Scrub', 8, NOW()),

-- Main Category 3: Advanced Nutrition/Supplements
(13, 'Advanced Nutrition/Supplements', NULL, NOW());

-- Create brands table if it doesn't exist
CREATE TABLE IF NOT EXISTS brands (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Insert brands
INSERT INTO brands (name) VALUES
('Environ'),
('Dermalogica'),
('Skintivity'),
('Rejuva'),
('Cosmedix'),
('Image'),
('Isispharma'),
('Mesoestetics'),
('Bioderma'),
('Skinceuticals'),
('Skinologic'),
('Salon Care'),
('Restore Skin'),
('25Pyskn'),
('Dr Obaggi');

-- Add brand_id column to products table if it doesn't exist
ALTER TABLE products ADD COLUMN IF NOT EXISTS brand_id INTEGER REFERENCES brands(id);

-- Add parent_id column to categories table if it doesn't exist
ALTER TABLE categories ADD COLUMN IF NOT EXISTS parent_id INTEGER REFERENCES categories(id);
