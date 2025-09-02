-- Seed common foods for Feel Sharper nutrition tracker
-- This populates the foods table with verified, commonly tracked foods

INSERT INTO public.foods (
  owner_user_id, name, brand, unit, kcal, protein_g, carbs_g, fat_g, 
  fiber_g, sugar_g, sodium_mg, verified_source
) VALUES
-- Proteins
(null, 'Chicken Breast', null, '100g', 165, 31.0, 0, 3.6, 0, 0, 74, true),
(null, 'Salmon Fillet', null, '100g', 208, 20.4, 0, 12.4, 0, 0, 59, true),
(null, 'Eggs', null, 'large', 70, 6.0, 0.6, 5.0, 0, 0.6, 70, true),
(null, 'Greek Yogurt Plain', null, '100g', 59, 10.0, 3.6, 0.4, 0, 3.6, 36, true),
(null, 'Whey Protein Powder', null, 'scoop', 120, 25.0, 2.0, 1.0, 0, 1.0, 50, true),
(null, 'Tuna in Water', null, '100g', 116, 25.5, 0, 0.8, 0, 0, 247, true),
(null, 'Cottage Cheese', null, '100g', 98, 11.1, 3.4, 4.3, 0, 2.7, 364, true),
(null, 'Lean Ground Beef', null, '100g', 250, 26.0, 0, 15.0, 0, 0, 75, true),

-- Carbohydrates
(null, 'White Rice Cooked', null, '100g', 130, 2.7, 28.0, 0.3, 0.4, 0.1, 1, true),
(null, 'Brown Rice Cooked', null, '100g', 112, 2.6, 23.0, 0.9, 1.8, 0.4, 5, true),
(null, 'Oats Dry', null, '100g', 389, 16.9, 66.3, 6.9, 10.6, 0.99, 2, true),
(null, 'Sweet Potato', null, '100g', 86, 1.6, 20.1, 0.1, 3.0, 4.2, 5, true),
(null, 'Banana', null, 'medium', 105, 1.3, 27.0, 0.4, 3.1, 14.4, 1, true),
(null, 'Apple', null, 'medium', 95, 0.5, 25.0, 0.3, 4.4, 19.0, 2, true),
(null, 'Whole Wheat Bread', null, 'slice', 69, 3.6, 11.6, 1.2, 1.9, 1.4, 132, true),
(null, 'Quinoa Cooked', null, '100g', 120, 4.4, 21.3, 1.9, 2.8, 0.9, 7, true),

-- Fats
(null, 'Avocado', null, '100g', 160, 2.0, 8.5, 14.7, 6.7, 0.7, 7, true),
(null, 'Almonds', null, '30g', 170, 6.0, 6.0, 15.0, 3.5, 1.2, 0, true),
(null, 'Olive Oil', null, 'tbsp', 119, 0, 0, 13.5, 0, 0, 0, true),
(null, 'Peanut Butter', null, '2tbsp', 190, 8.0, 8.0, 16.0, 3.0, 3.0, 140, true),
(null, 'Walnuts', null, '30g', 200, 5.0, 4.0, 20.0, 2.0, 1.0, 1, true),
(null, 'Coconut Oil', null, 'tbsp', 117, 0, 0, 14.0, 0, 0, 0, true),

-- Vegetables
(null, 'Broccoli', null, '100g', 34, 2.8, 7.0, 0.4, 2.6, 1.5, 33, true),
(null, 'Spinach', null, '100g', 23, 2.9, 3.6, 0.4, 2.2, 0.4, 79, true),
(null, 'Carrots', null, '100g', 41, 0.9, 9.6, 0.2, 2.8, 4.7, 69, true),
(null, 'Bell Pepper', null, '100g', 31, 1.0, 7.3, 0.3, 2.5, 4.2, 4, true),
(null, 'Cucumber', null, '100g', 16, 0.7, 4.0, 0.1, 0.5, 1.7, 2, true),
(null, 'Tomato', null, '100g', 18, 0.9, 3.9, 0.2, 1.2, 2.6, 5, true),

-- Dairy
(null, 'Milk 2%', null, '240ml', 122, 8.1, 11.7, 4.8, 0, 12.3, 115, true),
(null, 'Cheddar Cheese', null, '30g', 113, 7.0, 0.4, 9.3, 0, 0.1, 174, true),
(null, 'Mozzarella Cheese', null, '30g', 85, 6.3, 0.6, 6.3, 0, 0.4, 178, true),

-- Snacks & Treats
(null, 'Dark Chocolate 70%', null, '30g', 170, 2.2, 13.0, 12.0, 3.1, 6.8, 7, true),
(null, 'Protein Bar', null, 'bar', 200, 20.0, 22.0, 7.0, 3.0, 2.0, 200, true),

-- Beverages
(null, 'Coffee Black', null, '240ml', 2, 0.3, 0, 0, 0, 0, 5, true),
(null, 'Green Tea', null, '240ml', 2, 0.5, 0, 0, 0, 0, 2, true);

-- Update the updated_at timestamp for all inserted foods
UPDATE public.foods SET updated_at = now() WHERE verified_source = true;
