import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  collection,
  query,
  where,
  getCountFromServer,
} from "firebase/firestore";
import { db } from "@/lib/firebase";

const CACHE_EXPIRY_MS = 7 * 24 * 60 * 60 * 1000;

export async function getStudentCount(className: string): Promise<number> {
  try {
    const cacheKey = `@student_count_${className.replace(/\s+/g, "_")}`;
    const cachedStr = await AsyncStorage.getItem(cacheKey);

    if (cachedStr) {
      const { count, timestamp } = JSON.parse(cachedStr);
      if (Date.now() - timestamp < CACHE_EXPIRY_MS) {
        return count;
      }
    }

    const studentsCol = collection(db, "students");
    const q = query(studentsCol, where("class", "==", className));
    const snapshot = await getCountFromServer(q);
    const count = snapshot.data().count;

    await AsyncStorage.setItem(
      cacheKey,
      JSON.stringify({ count, timestamp: Date.now() }),
    );

    return count;
  } catch (err) {
    console.error("Error fetching student count:", err);
    return 0;
  }
}

export async function clearStudentCountCache(className?: string) {
  try {
    if (className) {
      const cacheKey = `@student_count_${className.replace(/\s+/g, "_")}`;
      await AsyncStorage.removeItem(cacheKey);
    } else {
      const keys = await AsyncStorage.getAllKeys();
      const classKeys = keys.filter((key) => key.startsWith("@student_count_"));
      await AsyncStorage.multiRemove(classKeys);
    }
  } catch (err) {
    console.error("Error clearing student count cache:", err);
  }
}
