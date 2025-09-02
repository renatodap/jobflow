# **Feel Sharper - Seed Data Sources**

This document tracks the sources and verification status of all seeded data in the Feel Sharper fitness tracker.

## **Common Foods Database**

**File**: `data/foods_common.csv`  
**Purpose**: Provides a starter set of verified common foods to reduce user friction when starting to track nutrition.

### **Data Sources & Verification**

All nutritional values in `foods_common.csv` are sourced from the **USDA FoodData Central Database** (https://fdc.nal.usda.gov/), which provides the most authoritative nutritional data for common foods.

**Verification Process**:
1. Each food item cross-referenced with USDA FoodData Central
2. Values taken from "SR Legacy" dataset (most comprehensive)  
3. Serving sizes standardized to common units (g, ml, item)
4. All entries marked with `verified_source = true` in database

### **Food List Coverage**

**Carbohydrates**: Rice (white, brown), oatmeal, quinoa, sweet potato  
**Proteins**: Chicken breast, egg, salmon, tuna, cottage cheese, Greek yogurt  
**Fats**: Olive oil, avocado, almonds, peanut butter  
**Fruits**: Apple, banana (whole fruit with standard serving sizes)  
**Vegetables**: Broccoli, spinach (cooked/raw as specified)  
**Dairy**: Whole milk, Greek yogurt, cottage cheese  

### **Unit Standards**

- **Solids**: Grams (g) for weight-based foods
- **Liquids**: Milliliters (ml) for volume-based foods  
- **Whole items**: "item" for foods typically consumed as units (apple, banana, egg)

### **Nutritional Completeness**

Each food includes:
- **Macronutrients**: Calories, protein, carbohydrates, fat
- **Key micronutrients**: Fiber, sugar, sodium, potassium, vitamin C
- **Serving context**: Per 100g, per ml, or per typical item

## **User Data Policy**

**❌ NO FAKE USER DATA**: The seed script contains ONLY verified food library data. No fake user accounts, meals, workouts, or personal data are seeded.

**✅ Users create their own**: 
- Personal food diary entries
- Custom workouts and exercises  
- Body weight measurements
- Personal food preferences and saved meals

## **Data Integrity**

**Multi-tenant safety**: All user-specific tables enforce Row-Level Security (RLS) policies ensuring users can only access their own data.

**Food sharing**: Common foods (owner_user_id = null) are readable by all users, while custom user foods (owner_user_id = user_id) remain private.

## **Maintenance**

**Updates**: Food database may be updated with additional verified foods based on user feedback and requests.  
**Sources**: All updates must reference authoritative nutritional databases (USDA, verified food manufacturers).  
**Verification**: New foods require source documentation before inclusion.

---

*Last Updated: 2025-08-12*  
*Source Database: USDA FoodData Central SR Legacy Dataset*