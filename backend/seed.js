const mongoose = require('mongoose');
const Catalog = require('./models/Catalog');

mongoose.connect('mongodb://127.0.0.1:27017/kumawat_enterprises')
  .then(async () => {
  console.log('MongoDB Connected for Seeding');
  
  await Catalog.deleteMany(); // Clear existing catalogs
  
  const catalogs = [
    { name: 'Kitchen', ratePerSqFt: 1200 },
    { name: 'Wardrobe', ratePerSqFt: 1000 },
    { name: 'Bed', ratePerSqFt: 800 },
    { name: 'TV Unit', ratePerSqFt: 1500 },
    { name: 'Sofa', ratePerSqFt: 900 },
    { name: 'Dining Table', ratePerSqFt: 1100 },
    { name: 'Dressing Table', ratePerSqFt: 850 },
    { name: 'Shoe Rack', ratePerSqFt: 700 },
    { name: 'Bookshelf', ratePerSqFt: 950 },
    { name: 'Bathroom Vanity', ratePerSqFt: 1300 },
    { name: 'Office Desk', ratePerSqFt: 1000 },
    { name: 'Other', ratePerSqFt: 0 }
  ];
  
  await Catalog.insertMany(catalogs);
  console.log('Catalogs Seeded');
  process.exit();
}).catch(err => console.log(err));
