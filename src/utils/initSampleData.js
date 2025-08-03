// Sample data initialization script
import { dbService } from '../services/dbService';

export const initSampleData = async () => {
  try {
    console.log('Initializing sample data...');

    // Sample Categories
    const categories = [
      { name: 'Cartridges', isActive: true, description: 'Printer cartridges for all brands' },
      { name: 'Inks', isActive: true, description: 'Ink bottles and refills' },
      { name: 'Drums', isActive: true, description: 'Drum units for laser printers' },
      { name: 'Toners', isActive: true, description: 'Toner cartridges and powder' }
    ];

    // Create categories
    for (const category of categories) {
      try {
        await dbService.create('categories', category);
        console.log(`Created category: ${category.name}`);
      } catch (error) {
        console.log(`Category ${category.name} might already exist:`, error.message);
      }
    }

    // Sample Products
    const products = [
      {
        name: 'HP 12A Black Cartridge',
        sku: 'HP_12A_BK',
        category: 'cartridges',
        description: 'Compatible black cartridge for HP printers',
        costPrice: 320,
        wholesalePrice: 380,
        retailPrice: 450,
        currentStock: 25,
        minStockLevel: 5,
        maxStockLevel: 100,
        compatibility: ['103', '303', '703'],
        isActive: true,
        availableForRetail: true,
        availableForWholesale: true,
        minOrderQuantity: 1,
        unit: 'piece'
      },
      {
        name: 'Canon Ink Bottle Black',
        sku: 'CAN_INK_BK',
        category: 'inks',
        description: 'Original Canon ink bottle for inkjet printers',
        costPrice: 280,
        wholesalePrice: 340,
        retailPrice: 420,
        currentStock: 15,
        minStockLevel: 3,
        maxStockLevel: 50,
        compatibility: ['G1000', 'G2000', 'G3000'],
        isActive: true,
        availableForRetail: true,
        availableForWholesale: true,
        minOrderQuantity: 1,
        unit: 'piece'
      },
      {
        name: 'Brother Drum Unit',
        sku: 'BR_DRUM_001',
        category: 'drums',
        description: 'Brother drum unit for laser printers',
        costPrice: 850,
        wholesalePrice: 950,
        retailPrice: 1150,
        currentStock: 8,
        minStockLevel: 2,
        maxStockLevel: 25,
        compatibility: ['HL-1110', 'HL-1210W', 'DCP-1510'],
        isActive: true,
        availableForRetail: true,
        availableForWholesale: true,
        minOrderQuantity: 1,
        unit: 'piece'
      },
      {
        name: 'Samsung Toner MLT-D111S',
        sku: 'SAM_D111S',
        category: 'toners',
        description: 'Samsung toner cartridge for monochrome printers',
        costPrice: 480,
        wholesalePrice: 580,
        retailPrice: 720,
        currentStock: 12,
        minStockLevel: 3,
        maxStockLevel: 40,
        compatibility: ['M2020', 'M2070'],
        isActive: true,
        availableForRetail: true,
        availableForWholesale: true,
        minOrderQuantity: 1,
        unit: 'piece'
      },
      {
        name: 'Epson 664 Ink Set',
        sku: 'EPS_664_SET',
        category: 'inks',
        description: 'Complete 4-color ink set for Epson printers',
        costPrice: 680,
        wholesalePrice: 780,
        retailPrice: 950,
        currentStock: 20,
        minStockLevel: 5,
        maxStockLevel: 60,
        compatibility: ['L120', 'L210', 'L380'],
        isActive: true,
        availableForRetail: true,
        availableForWholesale: true,
        minOrderQuantity: 1,
        unit: 'set'
      },
      {
        name: 'HP 85A Toner Cartridge',
        sku: 'HP_85A_TN',
        category: 'toners',
        description: 'High yield HP toner for LaserJet printers',
        costPrice: 420,
        wholesalePrice: 510,
        retailPrice: 650,
        currentStock: 18,
        minStockLevel: 4,
        maxStockLevel: 80,
        compatibility: ['P1102', 'M1212', 'M1132'],
        isActive: true,
        availableForRetail: true,
        availableForWholesale: true,
        minOrderQuantity: 1,
        unit: 'piece'
      }
    ];

    // Create products
    for (const product of products) {
      try {
        await dbService.create('products', product);
        console.log(`Created product: ${product.name}`);
      } catch (error) {
        console.log(`Product ${product.name} might already exist:`, error.message);
      }
    }

    console.log('Sample data initialization completed!');
    return { success: true, message: 'Sample data created successfully' };

  } catch (error) {
    console.error('Error initializing sample data:', error);
    return { success: false, message: error.message };
  }
};