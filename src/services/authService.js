// src/services/authService.js - UPDATED WITH APPROVAL LOGIC
import { 
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  sendPasswordResetEmail,
  onAuthStateChanged
} from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { auth, db } from "../config/firebase";

export const authService = {
  // Register new user
  async register(email, password, userData) {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      // Update profile
      await updateProfile(user, {
        displayName: userData.displayName
      });
      
      // Create user document in Firestore with approval status
      const userDoc = {
        uid: user.uid,
        email: user.email,
        displayName: userData.displayName,
        role: userData.role || "customer_retail",
        customerType: userData.customerType || "retail",
        phone: userData.phone || "",
        // Approval system for wholesale customers
        isApproved: userData.customerType === 'retail', // Retail customers are auto-approved
        approvalStatus: userData.customerType === 'wholesale' ? 'pending' : 'approved',
        requestedAt: userData.customerType === 'wholesale' ? new Date() : null,
        approvedAt: userData.customerType === 'retail' ? new Date() : null,
        approvalReason: "",
        isActive: true,
        createdAt: new Date(),
        lastLogin: new Date()
      };
      
      await setDoc(doc(db, "users", user.uid), userDoc);
      
      return user;
    } catch (error) {
      throw error;
    }
  },

  // Login user with approval check
  async login(email, password) {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      // Get user profile to check approval status
      const userProfile = await this.getUserProfile(user.uid);
      
      // Check if wholesale customer is approved
      if (userProfile.customerType === 'wholesale' && userProfile.approvalStatus !== 'approved') {
        // Don't update last login for unapproved users
        throw new Error('APPROVAL_PENDING');
      }
      
      // Update last login for approved users
      await setDoc(doc(db, "users", user.uid), {
        lastLogin: new Date()
      }, { merge: true });
      
      return user;
    } catch (error) {
      if (error.message === 'APPROVAL_PENDING') {
        throw new Error('Your wholesale account is pending admin approval');
      }
      throw error;
    }
  },

  // Logout user
  async logout() {
    try {
      await signOut(auth);
    } catch (error) {
      throw error;
    }
  },

  // Reset password
  async resetPassword(email) {
    try {
      await sendPasswordResetEmail(auth, email);
    } catch (error) {
      throw error;
    }
  },

  // Get user profile
  async getUserProfile(uid) {
    try {
      const docRef = doc(db, "users", uid);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() };
      } else {
        throw new Error("User profile not found");
      }
    } catch (error) {
      throw error;
    }
  },

  // Check if user can access the system
  async checkUserAccess(uid) {
    try {
      const userProfile = await this.getUserProfile(uid);
      
      // Retail customers always have access
      if (userProfile.customerType === 'retail') {
        return { hasAccess: true, reason: null };
      }
      
      // Wholesale customers need approval
      if (userProfile.customerType === 'wholesale') {
        switch (userProfile.approvalStatus) {
          case 'approved':
            return { hasAccess: true, reason: null };
          case 'pending':
            return { 
              hasAccess: false, 
              reason: 'Your wholesale account is pending admin approval' 
            };
          case 'rejected':
            return { 
              hasAccess: false, 
              reason: 'Your wholesale account application has been rejected. Please contact support.' 
            };
          default:
            return { hasAccess: false, reason: 'Unknown approval status' };
        }
      }
      
      return { hasAccess: true, reason: null };
    } catch (error) {
      throw error;
    }
  },

  // Auth state observer
  onAuthStateChange(callback) {
    return onAuthStateChanged(auth, callback);
  },

  // Send approval notification email (placeholder)
  async sendApprovalEmail(email, status, reason = '') {
    try {
      // TODO: Implement email service integration
      // This could use Firebase Functions, SendGrid, or other email service
      console.log(`Sending ${status} email to ${email}`, reason);
      
      // For now, just log the action
      // In production, you would call your email service here
      
      return { success: true };
    } catch (error) {
      console.error('Failed to send approval email:', error);
      throw error;
    }
  }
};