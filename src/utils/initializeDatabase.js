// src/utils/initializeDatabase.js
import { collection, addDoc, doc, setDoc } from "firebase/firestore";
import { db } from "../config/firebase";

export const initializeDatabase = async () => {
  try {
    console.log("Initializing database...");

    // 1. Create Categories
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

    // 2. Create Sample Products
    const products =  [     // Cartridges
      {
        name: "HP 12A Cartridge (Q2612A)",
        category: "cartridges",
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
        name: "12A Cartridge",
        category: "cartridges",
        compatibility: ["103", "303", "703"],
        sku: "CART_12A",
        description: "Compatible with HP 103/303/703 printers",
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
          brand: "Compatible"
        }
      },
      {
        name: "12A Drum",
        category: "drums", 
        compatibility: ["103", "303", "703"],
        sku: "DRUM_12A",
        description: "Drum unit compatible with HP 103/303/703 printers",
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
          brand: "Compatible"
        }
      },
      {
        name: "HP 305 Black Ink",
        category: "inks",
        compatibility: ["DeskJet 2710", "DeskJet 2720", "DeskJet 4100"],
        sku: "INK_HP305_BK",
        description: "Original HP 305 Black Ink Cartridge",
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
          brand: "HP Original"
        }
      },
      {
        name: "Canon 047 Cartridge",
        category: "cartridges",
        compatibility: ["LBP112", "LBP113w", "MF113w"],
        sku: "CART_CAN047",
        description: "Compatible cartridge for Canon 047 printers",
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
          brand: "Compatible"
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
        autoReorderPoint: true
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