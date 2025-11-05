import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { fetchNumberOfStudents } from "@/services/studentsServices";
import { getAttendanceSummary } from "@/services/attendenceServices";
import { db } from "@/lib/firebase";
import { collection, getDocs } from "firebase/firestore";

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

  const fetchAndSetPrincipalName = async () => {
    try {
      const info = await AsyncStorage.getItem("@principal_info");
      if (info) {
        const parsed = JSON.parse(info);
        if (parsed.name) setName(parsed.name);
      } else {
        console.warn("@principal_info not found in AsyncStorage");
      }
    } catch (err) {
      console.error("Error fetching principal info:", err);
    }
  };

  const refreshClasses = async () => {
    try {
      const cached = await AsyncStorage.getItem("@classes");
      if (cached) {
        setClasses(JSON.parse(cached));
      }

      const snapshot = await getDocs(collection(db, "classes"));
      const classList = snapshot.docs.map((doc) => doc.data().class as string);

      if (classList.length > 0) {
        setClasses(classList);
        await AsyncStorage.setItem("@classes", JSON.stringify(classList));
      } else {
        console.warn("No classes found in Firestore");
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

      const today = new Date();
      const summary = await getAttendanceSummary(undefined, today);

      setPresentToday(summary.present);
      setAbsentToday(summary.absent);
      setAttendanceRate(summary.rate);
      setAttendanceTakenToday(summary.total > 0);
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
