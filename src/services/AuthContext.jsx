// AuthContext.jsx
import React, { createContext, useContext, useState, useEffect } from "react";
import {
  getAuth,
  onAuthStateChanged,
  signOut,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from "firebase/auth";
import { auth, db } from "../firebase";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(true);

  // Existing useEffect for auth state change
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);

        // Fetch the user's role from Firestore
        const userDoc = await getDoc(doc(db, "profiles", currentUser.uid));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          setUserRole(userData.role || "user");
        } else {
          setUserRole("user"); // Default role if not found
        }
      } else {
        setUser(null);
        setUserRole(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signUp = async (
    email,
    password,
    username,
    role,
    bio = "",
    wallet = ""
  ) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      const newUser = userCredential.user;

      // Create a profile document in Firestore
      await setDoc(doc(db, "profiles", newUser.uid), {
        username,
        bio: bio, // if user is just a user, bio might be empty string
        wallet: wallet, // if user is just a user, wallet might be empty string
        role,
        email: newUser.email,
        registrationDate: serverTimestamp(),
        totalTips: 0,
      });

      setUser(newUser);
      setUserRole(role); // Set the user role in the state
      return newUser;
    } catch (error) {
      console.error("Error signing up:", error);
      throw error;
    }
  };

  const logIn = async (email, password) => {
    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      setUser(userCredential.user);
      return userCredential.user;
    } catch (error) {
      console.error("Error logging in:", error);
      throw error;
    }
  };

  const logOut = async () => {
    try {
      await signOut(auth);
      setUser(null);
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };
  return (
    <AuthContext.Provider
      value={{ user, userRole, loading, signUp, logIn, logOut }}
    >
      {!loading && children}
    </AuthContext.Provider>
  );
};

export { AuthProvider };
