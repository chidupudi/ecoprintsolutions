// src/utils/createAdminUser.js
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { auth, db } from "../config/firebase";

export const createAdminUser = async (email, password, displayName) => {
  try {
    // Create user in Firebase Auth
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Update profile
    await updateProfile(user, {
      displayName: displayName
    });

    // Create admin user document in Firestore
    await setDoc(doc(db, "users", user.uid), {
      uid: user.uid,
      email: user.email,
      displayName: displayName,
      role: "admin",
      permissions: [
        "inventory_read",
        "inventory_write", 
        "sales_read",
        "sales_write",
        "reports_read",
        "user_management",
        "settings_write"
      ],
      customerType: null,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      lastLogin: new Date()
    });

    console.log("Admin user created successfully!");
    return { success: true, user: user };

  } catch (error) {
    console.error("Error creating admin user:", error);
    return { success: false, error: error.message };
  }
};