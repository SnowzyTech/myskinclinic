// Scratch script to add "The Regime" brand to Supabase database
const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

// Parse .env.local manually to avoid external dependency on dotenv
try {
  const envPath = path.resolve(process.cwd(), '.env.local');
  const envConfig = fs.readFileSync(envPath, 'utf-8');
  const env = {};
  envConfig.split(/\r?\n/).forEach(line => {
    const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
    if (match) {
      const key = match[1];
      let value = match[2] || '';
      // Remove trailing comments or spaces
      value = value.trim();
      if (value.startsWith('"') && value.endsWith('"')) {
        value = value.slice(1, -1);
      } else if (value.startsWith("'") && value.endsWith("'")) {
        value = value.slice(1, -1);
      }
      env[key] = value;
    }
  });

  const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    console.error("Missing Supabase environment variables in env parsing!");
    process.exit(1);
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  async function addBrand() {
    const brandName = "The Regime";
    console.log(`Attempting to add brand: "${brandName}" to ${supabaseUrl}...`);
    
    const { data, error } = await supabase
      .from('brands')
      .insert([{ name: brandName }])
      .select();

    if (error) {
      if (error.code === '23505') {
        console.log(`Brand "${brandName}" already exists in the database!`);
      } else {
        console.error("Error inserting brand:", error);
      }
    } else {
      console.log("Successfully added brand:", data);
    }
  }

  addBrand();
} catch (err) {
  console.error("Failed to read environment or run script:", err);
}
