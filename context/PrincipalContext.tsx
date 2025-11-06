import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { fetchNumberOfStudents } from "@/services/studentsServices";
import { db } from "@/lib/firebase";
import {
  collection,
  getDocs,
  onSnapshot,
  query,
  where,
} from "firebase/firestore";

type PrincipalContextType = {
  name: string | null;
  totalStudents: number;
  presentToday: number;
  absentToday: number;
  attendanceTakenToday: boolean;
  attendanceRate: number;
  classes: string[];
  loading: boolean;
  refreshPrincipalInfo: () => Promise<void>;
  refreshClasses: () => Promise<void>;
};

const PrincipalContext = createContext<PrincipalContextType | undefined>(
  undefined,
);

type Props = { children: ReactNode };

export function PrincipalProvider({ children }: Props) {
  const [name, setName] = useState<string | null>(null);
  const [totalStudents, setTotalStudents] = useState(0);
  const [presentToday, setPresentToday] = useState(0);
  const [absentToday, setAbsentToday] = useState(0);
  const [attendanceRate, setAttendanceRate] = useState(0);
  const [attendanceTakenToday, setAttendanceTakenToday] = useState(true);
  const [classes, setClasses] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      await Promise.all([fetchAndSetPrincipalName(), refreshClasses()]);
      await refreshPrincipalInfo();
    })();
  }, []);

  useEffect(() => {
    const today = new Date().toISOString().split("T")[0];
    const attendanceQuery = query(
      collection(db, "attendance"),
      where("date", "==", today),
    );

    const unsubscribe = onSnapshot(attendanceQuery, (snapshot) => {
      const records = snapshot.docs.map((doc) => doc.data());
      const present = records.filter((r) => r.status === "present").length;
      const total = records.length;
      const absent = total - present;
      const rate = total === 0 ? 0 : Math.round((present / total) * 100);

      setPresentToday(present);
      setAbsentToday(absent);
      setAttendanceRate(rate);
      setAttendanceTakenToday(total > 0);
    });

    return () => unsubscribe();
  }, []);

  const fetchAndSetPrincipalName = async () => {
    try {
      const info = await AsyncStorage.getItem("@principal_info");
      if (info) {
        const parsed = JSON.parse(info);
        if (parsed.name) setName(parsed.name);
      }
    } catch (err) {
      console.error("Error fetching principal info:", err);
    }
  };

  const refreshClasses = async () => {
    try {
      const cached = await AsyncStorage.getItem("@classes");
      if (cached) setClasses(JSON.parse(cached));

      const snapshot = await getDocs(collection(db, "classes"));
      const classList = snapshot.docs.map((doc) => doc.data().class as string);

      if (classList.length > 0) {
        setClasses(classList);
        await AsyncStorage.setItem("@classes", JSON.stringify(classList));
      }
    } catch (err) {
      console.error("Error fetching class list:", err);
    }
  };

  const refreshPrincipalInfo = async () => {
    try {
      setLoading(true);
      if (!name) await fetchAndSetPrincipalName();

      const total = await fetchNumberOfStudents();
      setTotalStudents(total);
    } catch (err) {
      console.error("Error refreshing principal info:", err);
    } finally {
      setLoading(false);
    }
  };

  const value: PrincipalContextType = {
    name,
    totalStudents,
    presentToday,
    absentToday,
    attendanceTakenToday,
    attendanceRate,
    classes,
    loading,
    refreshPrincipalInfo,
    refreshClasses,
  };

  return (
    <PrincipalContext.Provider value={value}>
      {children}
    </PrincipalContext.Provider>
  );
}

export function usePrincipal() {
  const context = useContext(PrincipalContext);
  if (!context)
    throw new Error("usePrincipal must be used within a PrincipalProvider");
  return context;
}
