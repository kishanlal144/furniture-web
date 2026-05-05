const { pool } = require('./database');

const furnitureProducts = [
  // Living Room Furniture
  { name: 'Sofa Set (3 Seater)', category: 'Living Room', description: 'Premium 3-seater sofa with cushions', rate_per_sqft: 450, hsn_code: '94017100' },
  { name: 'Sofa Set (5 Seater)', category: 'Living Room', description: 'Luxury 5-seater L-shaped sofa', rate_per_sqft: 480, hsn_code: '94017100' },
  { name: 'Center Table', category: 'Living Room', description: 'Modern center table with storage', rate_per_sqft: 380, hsn_code: '94036000' },
  { name: 'TV Unit', category: 'Living Room', description: 'Wall-mounted TV unit with shelves', rate_per_sqft: 420, hsn_code: '94036000' },
  { name: 'Coffee Table', category: 'Living Room', description: 'Elegant coffee table', rate_per_sqft: 350, hsn_code: '94036000' },
  { name: 'Recliner Chair', category: 'Living Room', description: 'Comfortable recliner with footrest', rate_per_sqft: 500, hsn_code: '94017900' },
  { name: 'Bookshelf', category: 'Living Room', description: 'Wooden bookshelf with multiple shelves', rate_per_sqft: 320, hsn_code: '94036000' },
  { name: 'Display Cabinet', category: 'Living Room', description: 'Glass display cabinet', rate_per_sqft: 400, hsn_code: '94036000' },
  
  // Bedroom Furniture
  { name: 'King Size Bed', category: 'Bedroom', description: 'King size bed with storage', rate_per_sqft: 520, hsn_code: '94035000' },
  { name: 'Queen Size Bed', category: 'Bedroom', description: 'Queen size bed with headboard', rate_per_sqft: 480, hsn_code: '94035000' },
  { name: 'Single Bed', category: 'Bedroom', description: 'Single bed with mattress support', rate_per_sqft: 380, hsn_code: '94035000' },
  { name: 'Wardrobe (2 Door)', category: 'Bedroom', description: '2-door wardrobe with mirror', rate_per_sqft: 450, hsn_code: '94036000' },
  { name: 'Wardrobe (3 Door)', category: 'Bedroom', description: '3-door wardrobe with drawers', rate_per_sqft: 480, hsn_code: '94036000' },
  { name: 'Wardrobe (4 Door)', category: 'Bedroom', description: '4-door sliding wardrobe', rate_per_sqft: 520, hsn_code: '94036000' },
  { name: 'Dressing Table', category: 'Bedroom', description: 'Dressing table with mirror and drawers', rate_per_sqft: 420, hsn_code: '94036000' },
  { name: 'Bedside Table', category: 'Bedroom', description: 'Compact bedside table with drawer', rate_per_sqft: 280, hsn_code: '94036000' },
  { name: 'Chest of Drawers', category: 'Bedroom', description: '5-drawer chest for storage', rate_per_sqft: 380, hsn_code: '94036000' },
  
  // Kitchen Furniture
  { name: 'Modular Kitchen (Base Unit)', category: 'Kitchen', description: 'Base cabinets with drawers', rate_per_sqft: 550, hsn_code: '94036000' },
  { name: 'Modular Kitchen (Wall Unit)', category: 'Kitchen', description: 'Wall-mounted cabinets', rate_per_sqft: 480, hsn_code: '94036000' },
  { name: 'Kitchen Island', category: 'Kitchen', description: 'Central kitchen island with storage', rate_per_sqft: 600, hsn_code: '94036000' },
  { name: 'Pantry Unit', category: 'Kitchen', description: 'Tall pantry storage unit', rate_per_sqft: 520, hsn_code: '94036000' },
  { name: 'Kitchen Trolley', category: 'Kitchen', description: 'Mobile kitchen trolley', rate_per_sqft: 350, hsn_code: '94036000' },
  
  // Dining Furniture
  { name: 'Dining Table (4 Seater)', category: 'Dining', description: '4-seater dining table', rate_per_sqft: 420, hsn_code: '94036000' },
  { name: 'Dining Table (6 Seater)', category: 'Dining', description: '6-seater dining table', rate_per_sqft: 450, hsn_code: '94036000' },
  { name: 'Dining Table (8 Seater)', category: 'Dining', description: '8-seater dining table', rate_per_sqft: 480, hsn_code: '94036000' },
  { name: 'Dining Chair', category: 'Dining', description: 'Cushioned dining chair', rate_per_sqft: 180, hsn_code: '94017900' },
  { name: 'Crockery Unit', category: 'Dining', description: 'Crockery display and storage unit', rate_per_sqft: 420, hsn_code: '94036000' },
  { name: 'Bar Cabinet', category: 'Dining', description: 'Bar cabinet with glass holders', rate_per_sqft: 480, hsn_code: '94036000' },
  
  // Office Furniture
  { name: 'Office Desk', category: 'Office', description: 'Executive office desk with drawers', rate_per_sqft: 450, hsn_code: '94036000' },
  { name: 'Computer Table', category: 'Office', description: 'Compact computer table', rate_per_sqft: 350, hsn_code: '94036000' },
  { name: 'Office Chair', category: 'Office', description: 'Ergonomic office chair', rate_per_sqft: 280, hsn_code: '94017900' },
  { name: 'Filing Cabinet', category: 'Office', description: '4-drawer filing cabinet', rate_per_sqft: 380, hsn_code: '94036000' },
  { name: 'Conference Table', category: 'Office', description: 'Large conference table', rate_per_sqft: 520, hsn_code: '94036000' },
  { name: 'Reception Desk', category: 'Office', description: 'Modern reception desk', rate_per_sqft: 480, hsn_code: '94036000' },
  
  // Storage & Others
  { name: 'Shoe Rack', category: 'Storage', description: 'Multi-tier shoe rack', rate_per_sqft: 280, hsn_code: '94036000' },
  { name: 'Study Table', category: 'Study', description: 'Study table with bookshelf', rate_per_sqft: 380, hsn_code: '94036000' },
  { name: 'Wall Shelf', category: 'Storage', description: 'Floating wall shelf', rate_per_sqft: 250, hsn_code: '94036000' },
  { name: 'Pooja Unit', category: 'Religious', description: 'Traditional pooja unit', rate_per_sqft: 420, hsn_code: '94036000' },
  { name: 'Mirror Frame', category: 'Decor', description: 'Decorative mirror with frame', rate_per_sqft: 320, hsn_code: '94036000' },
  { name: 'Console Table', category: 'Living Room', description: 'Entrance console table', rate_per_sqft: 380, hsn_code: '94036000' },
  { name: 'Ottoman', category: 'Living Room', description: 'Storage ottoman', rate_per_sqft: 280, hsn_code: '94017900' },
  { name: 'Bench', category: 'Seating', description: 'Wooden bench with cushion', rate_per_sqft: 320, hsn_code: '94017900' },
  { name: 'Kids Bed', category: 'Kids Room', description: 'Colorful kids bed with storage', rate_per_sqft: 420, hsn_code: '94035000' },
  { name: 'Kids Study Table', category: 'Kids Room', description: 'Adjustable kids study table', rate_per_sqft: 350, hsn_code: '94036000' },
  { name: 'Toy Storage Unit', category: 'Kids Room', description: 'Multi-compartment toy storage', rate_per_sqft: 320, hsn_code: '94036000' }
];

const seedProducts = async () => {
  try {
    console.log('🌱 Seeding furniture products...');
    
    for (const product of furnitureProducts) {
      await pool.query(
        `INSERT INTO products (name, category, description, rate_per_sqft, hsn_code, tax_rate, is_active)
         VALUES (?, ?, ?, ?, ?, 18.00, TRUE)
         ON DUPLICATE KEY UPDATE 
         category = VALUES(category),
         description = VALUES(description),
         rate_per_sqft = VALUES(rate_per_sqft),
         hsn_code = VALUES(hsn_code)`,
        [product.name, product.category, product.description, product.rate_per_sqft, product.hsn_code]
      );
    }
    
    console.log(`✅ Successfully seeded ${furnitureProducts.length} furniture products`);
  } catch (error) {
    console.error('❌ Error seeding products:', error);
    throw error;
  }
};

module.exports = { seedProducts };

// Made with Bob
