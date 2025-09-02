import { config } from "dotenv";
config({ path: ".env.local" });
import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "fs";
import { join } from "path";

// Parse CSV helper
function parseCSV(csvText: string): Record<string, string>[] {
  const lines = csvText.trim().split('\n');
  const headers = lines[0].split(',').map(h => h.replace(/"/g, ''));
  
  return lines.slice(1).map(line => {
    const values = line.split(',').map(v => v.replace(/"/g, ''));
    const obj: Record<string, string> = {};
    headers.forEach((header, index) => {
      obj[header] = values[index] || '';
    });
    return obj;
  });
}

async function seedCommonFoods(supabase: any) {
  console.log("Loading common foods from CSV...");
  
  const csvPath = join(process.cwd(), 'data', 'foods_common.csv');
  const csvData = readFileSync(csvPath, 'utf-8');
  const foods = parseCSV(csvData);
  
  console.log(`Found ${foods.length} foods to seed`);
  
  const foodsToInsert = foods.map(food => ({
    owner_user_id: null, // null = public food
    name: food.name,
    brand: food.brand || null,
    unit: food.unit,
    kcal: parseFloat(food.kcal),
    protein_g: parseFloat(food.protein_g),
    carbs_g: parseFloat(food.carbs_g),
    fat_g: parseFloat(food.fat_g),
    fiber_g: parseFloat(food.fiber_g),
    sugar_g: parseFloat(food.sugar_g),
    sodium_mg: parseFloat(food.sodium_mg),
    potassium_mg: parseFloat(food.potassium_mg),
    vit_c_mg: parseFloat(food.vit_c_mg),
    verified_source: true, // All CSV foods are USDA verified
  }));
  
  const { error } = await supabase.from("foods").insert(foodsToInsert);
  if (error) {
    if (error.code === '23505') { // Unique constraint violation - foods already exist
      console.log("Common foods already seeded, skipping...");
    } else {
      throw error;
    }
  } else {
    console.log(`Successfully seeded ${foods.length} common foods`);
  }
}

async function main() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const service = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  
  if (!url || !service) {
    throw new Error("Missing required environment variables: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY");
  }
  
  const supabase = createClient(url, service, { auth: { persistSession: false } });

  try {
    // Seed verified common foods (no fake user data)
    await seedCommonFoods(supabase);
    
    console.log("✅ Seed complete - No fake user data created");
    console.log("💡 Users will create their own accounts and track their own data");
  } catch (error) {
    console.error("❌ Seed failed:", error);
    throw error;
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
