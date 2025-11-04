// utils/studentCount.ts
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  collection,
  query,
  where,
  getCountFromServer,
} from "firebase/firestore";
import { db } from "@/lib/firebase";

const CACHE_EXPIRY_MS = 7 * 24 * 60 * 60 * 1000; // 1 day

export async function getStudentCount(className: string): Promise<number> {
  try {
    const cacheKey = `@student_count_${className.replace(/\s+/g, "_")}`;
    const cachedStr = await AsyncStorage.getItem(cacheKey);

    if (cachedStr) {
      const { count, timestamp } = JSON.parse(cachedStr);
      if (Date.now() - timestamp < CACHE_EXPIRY_MS) {
        // console.log(`Using cached student count for ${className}`);
        return count;
      }
    }

    // Cache expired or missing → fetch from Firestore
    const studentsCol = collection(db, "students");
    const q = query(studentsCol, where("class", "==", className));
    const snapshot = await getCountFromServer(q);
    const count = snapshot.data().count;

    // Store in AsyncStorage
    await AsyncStorage.setItem(
      cacheKey,
      JSON.stringify({ count, timestamp: Date.now() }),
    );

    // console.log(`Fetched student count from Firestore for ${className}`);
    return count;
  } catch (err) {
    console.error("Error fetching student count:", err);
    return 0;
  }
}

/**
 * Clear cached counts (optional, useful if you know data changed)
 */
export async function clearStudentCountCache(className?: string) {
  try {
    if (className) {
      const cacheKey = `@student_count_${className.replace(/\s+/g, "_")}`;
      await AsyncStorage.removeItem(cacheKey);
    } else {
      // Clear all class caches
      const keys = await AsyncStorage.getAllKeys();
      const classKeys = keys.filter((key) => key.startsWith("@student_count_"));
      await AsyncStorage.multiRemove(classKeys);
    }
  } catch (err) {
    console.error("Error clearing student count cache:", err);
  }
}
