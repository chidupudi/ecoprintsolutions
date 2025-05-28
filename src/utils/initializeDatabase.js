// src/utils/initializeDatabase.js - UPDATED VERSION
import { collection, addDoc, doc, setDoc } from "firebase/firestore";
import { db } from "../config/firebase";

export const initializeDatabase = async () => {
  try {
    console.log("Initializing database...");

    // 1. Create Categories with consistent structure
    const categories = [
      {
        id: "cartridges",
        name: "Cartridges",
        description: "Printer cartridges for various printer models",
        isActive: true
      },
      {
        id: "inks",
        name: "Inks", 
        description: "Printer inks and refills",
        isActive: true
      },
      {
        id: "drums",
        name: "Drums",
        description: "Printer drums and imaging units",
        isActive: true
      },
       {
        id: "toners",
        name: "Toners",
        description: "Laser printer toners",
        isActive: true
      }
    ];

    for (const category of categories) {
      await setDoc(doc(db, "categories", category.id), {
        ...category,
        createdAt: new Date(),
        updatedAt: new Date()
      });
    }

    // 2. Create Sample Products with correct category references
    const products = [
      // Cartridges
      {
        name: "HP 12A Cartridge (Q2612A)",
        category: "cartridges", // Use category ID
        compatibility: ["HP LaserJet 1010", "HP LaserJet 1012", "HP LaserJet 1015"],
        sku: "CART_HP12A",
        description: "Compatible cartridge for HP 12A. High quality print output with 2000 page yield.",
        retailPrice: 450,
        wholesalePrice: 380,
        costPrice: 320,
        currentStock: 25,
        minStockLevel: 5,
        maxStockLevel: 100,
        imageUrl: "",
        isActive: true,
        specifications: {
          color: "Black",
          pageYield: "2000 pages",
          brand: "Compatible",
          type: "Laser Cartridge"
        }
      },
      {
        name: "Canon 047 Cartridge",
        category: "cartridges",
        compatibility: ["Canon LBP112", "Canon LBP113w", "Canon MF113w"],
        sku: "CART_CAN047",
        description: "Compatible cartridge for Canon 047 printers. Reliable performance guaranteed.",
        retailPrice: 520,
        wholesalePrice: 440,
        costPrice: 360,
        currentStock: 20,
        minStockLevel: 5,
        maxStockLevel: 75,
        imageUrl: "",
        isActive: true,
        specifications: {
          color: "Black",
          pageYield: "1600 pages",
          brand: "Compatible",
          type: "Laser Cartridge"
        }
      },
      {
        name: "HP 88A Cartridge (CC388A)",
        category: "cartridges", 
        compatibility: ["HP LaserJet P1007", "HP LaserJet P1008", "HP LaserJet M1136"],
        sku: "CART_HP88A",
        description: "High quality compatible cartridge for HP 88A with excellent print quality.",
        retailPrice: 580,
        wholesalePrice: 490,
        costPrice: 410,
        currentStock: 18,
        minStockLevel: 4,
        maxStockLevel: 80,
        imageUrl: "",
        isActive: true,
        specifications: {
          color: "Black",
          pageYield: "1500 pages",
          brand: "Compatible",
          type: "Laser Cartridge"
        }
      },
      {
        name: "HP 35A Cartridge (CB435A)",
        category: "cartridges",
        compatibility: ["HP LaserJet P1005", "HP LaserJet P1006"],
        sku: "CART_HP35A",
        description: "Compatible cartridge for HP 35A printers.",
        retailPrice: 480,
        wholesalePrice: 400,
        costPrice: 330,
        currentStock: 22,
        minStockLevel: 5,
        maxStockLevel: 90,
        imageUrl: "",
        isActive: true,
        specifications: {
          color: "Black",
          pageYield: "1500 pages",
          brand: "Compatible",
          type: "Laser Cartridge"
        }
      },

      // Inks
      {
        name: "HP 305 Black Ink Cartridge",
        category: "inks",
        compatibility: ["HP DeskJet 2710", "HP DeskJet 2720", "HP DeskJet 4100"],
        sku: "INK_HP305_BK",
        description: "Original HP 305 Black Ink Cartridge for crisp text printing.",
        retailPrice: 890,
        wholesalePrice: 750,
        costPrice: 620,
        currentStock: 30,
        minStockLevel: 8,
        maxStockLevel: 80,
        imageUrl: "",
        isActive: true,
        specifications: {
          color: "Black",
          pageYield: "120 pages",
          brand: "HP Original",
          type: "Inkjet Cartridge"
        }
      },
      {
        name: "HP 305 Color Ink Cartridge",
        category: "inks",
        compatibility: ["HP DeskJet 2710", "HP DeskJet 2720", "HP DeskJet 4100"],
        sku: "INK_HP305_CLR",
        description: "Original HP 305 Color Ink Cartridge for vibrant color printing.",
        retailPrice: 1200,
        wholesalePrice: 1020,
        costPrice: 850,
        currentStock: 25,
        minStockLevel: 6,
        maxStockLevel: 60,
        imageUrl: "",
        isActive: true,
        specifications: {
          color: "Tri-Color (CMY)",
          pageYield: "100 pages",
          brand: "HP Original",
          type: "Inkjet Cartridge"
        }
      },
      {
        name: "Canon PG-47 Black Ink",
        category: "inks",
        compatibility: ["Canon PIXMA E404", "Canon PIXMA E414"],
        sku: "INK_CAN_PG47",
        description: "Original Canon PG-47 Black Ink Cartridge.",
        retailPrice: 950,
        wholesalePrice: 800,
        costPrice: 650,
        currentStock: 28,
        minStockLevel: 7,
        maxStockLevel: 70,
        imageUrl: "",
        isActive: true,
        specifications: {
          color: "Black",
          pageYield: "180 pages",
          brand: "Canon Original",
          type: "Inkjet Cartridge"
        }
      },

      // Drums
      {
        name: "HP 12A Drum Unit",
        category: "drums", 
        compatibility: ["HP LaserJet 1010", "HP LaserJet 1012", "HP LaserJet 1015"],
        sku: "DRUM_HP12A",
        description: "Drum unit compatible with HP 12A printers. Long lasting and reliable.",
        retailPrice: 850,
        wholesalePrice: 720,
        costPrice: 600,
        currentStock: 15,
        minStockLevel: 3,
        maxStockLevel: 50,
        imageUrl: "",
        isActive: true,
        specifications: {
          color: "Black",
          pageYield: "12000 pages",
          brand: "Compatible",
          type: "Drum Unit"
        }
      },
      {
        name: "Canon 047 Drum",
        category: "drums",
        compatibility: ["Canon LBP112", "Canon LBP113w"],
        sku: "DRUM_CAN047",
        description: "Compatible drum unit for Canon 047 series printers.",
        retailPrice: 920,
        wholesalePrice: 780,
        costPrice: 650,
        currentStock: 12,
        minStockLevel: 3,
        maxStockLevel: 40,
        imageUrl: "",
        isActive: true,
        specifications: {
          color: "Black",
          pageYield: "10000 pages",
          brand: "Compatible",
          type: "Drum Unit"
        }
      },

      // Toners
      {
        name: "HP 26A Toner (CF226A)",
        category: "toners",
        compatibility: ["HP LaserJet Pro M402", "HP LaserJet Pro M426"],
        sku: "TONER_HP26A",
        description: "High quality compatible toner for HP 26A printers.",
        retailPrice: 1200,
        wholesalePrice: 1000,
        costPrice: 850,
        currentStock: 20,
        minStockLevel: 4,
        maxStockLevel: 60,
        imageUrl: "",
        isActive: true,
        specifications: {
          color: "Black",
          pageYield: "3100 pages",
          brand: "Compatible",
          type: "Toner Cartridge"
        }
      },
      {
        name: "Canon 337 Toner",
        category: "toners",
        compatibility: ["Canon MF211", "Canon MF212w", "Canon MF215"],
        sku: "TONER_CAN337",
        description: "Compatible toner cartridge for Canon 337 printers.",
        retailPrice: 1350,
        wholesalePrice: 1150,
        costPrice: 950,
        currentStock: 18,
        minStockLevel: 4,
        maxStockLevel: 55,
        imageUrl: "",
        isActive: true,
        specifications: {
          color: "Black",
          pageYield: "2400 pages",
          brand: "Compatible",
          type: "Toner Cartridge"
        }
      }
    ];

    for (const product of products) {
      await addDoc(collection(db, "products"), {
        ...product,
        createdAt: new Date(),
        updatedAt: new Date()
      });
    }

    // 3. Create Sample Suppliers
    const suppliers = [
      {
        name: "PrintTech Suppliers",
        contactPerson: "Rajesh Kumar",
        email: "rajesh@printtech.com",
        phone: "+91 9876543210",
        address: {
          street: "123 Industrial Area",
          city: "Delhi",
          state: "Delhi",
          pincode: "110001",
          country: "India"
        },
        paymentTerms: "30 days",
        isActive: true
      },
      {
        name: "Ink Solutions Pvt Ltd",
        contactPerson: "Priya Sharma",
        email: "priya@inksolutions.com", 
        phone: "+91 9123456789",
        address: {
          street: "456 Tech Park",
          city: "Hyderabad",
          state: "Telangana", 
          pincode: "500032",
          country: "India"
        },
        paymentTerms: "15 days",
        isActive: true
      }
    ];

    for (const supplier of suppliers) {
      await addDoc(collection(db, "suppliers"), {
        ...supplier,
        createdAt: new Date(),
        updatedAt: new Date()
      });
    }

    // 4. Create System Settings
    const settings = {
      businessInfo: {
        name: "Eco Print Solutions",
        address: "Your Business Address",
        phone: "+91 XXXXXXXXXX",
        email: "info@ecoprintsolutions.com",
        gst: "GST_NUMBER",
        logo: ""
      },
      taxSettings: {
        gstRate: 18,
        enableGst: true
      },
      inventorySettings: {
        lowStockAlert: true,
        autoReorderPoint: true,
        defaultMargin: 25
      }
    };

    await setDoc(doc(db, "settings", "general"), {
      ...settings,
      createdAt: new Date(),
      updatedAt: new Date()
    });

    console.log("Database initialized successfully!");
    return { success: true, message: "Database initialized with sample data" };

  } catch (error) {
    console.error("Error initializing database:", error);
    return { success: false, error: error.message };
  }
};