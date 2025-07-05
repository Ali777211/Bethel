import { initializeApp } from "firebase/app";
import { initializeAuth, getReactNativePersistence } from "firebase/auth";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// const firebaseConfig = {
//   apiKey: "AIzaSyDebW2XdEuCLujhX9bbY9--o21RcKsUCCk",
//   authDomain: "citymanagmentsystem.firebaseapp.com",
//   projectId: "citymanagmentsystem",
//   storageBucket: "citymanagmentsystem.firebasestorage.app",
//   messagingSenderId: "44810089077",
//   appId: "1:44810089077:web:13e3b0141e9b1c129d7e3c",
//   measurementId: "G-54QQFDYPZ9",
// };
const firebaseConfig = {
  apiKey: "AIzaSyA6AGTm3ZECAUjmfpWEeskyFJ3rR4a7c94",
  authDomain: "bethelcms.firebaseapp.com",
  projectId: "bethelcms",
  storageBucket: "bethelcms.firebasestorage.app",
  messagingSenderId: "205013658467",
  appId: "1:205013658467:web:99c486274b2ec1bdb58156"
};

const app = initializeApp(firebaseConfig);

const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage),
});

const firestore = getFirestore(app);
const storage = getStorage(app);

export { app, auth, firestore, storage };
