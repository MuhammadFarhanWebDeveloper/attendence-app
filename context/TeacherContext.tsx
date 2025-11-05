import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { fetchStudents } from "@/services/studentsServices";
import { auth, db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";

type TeacherContextType = {
  students: Student[];
  studentCount: number;
  loading: boolean;
  refreshStudents: () => Promise<void>;
  setStudents: React.Dispatch<React.SetStateAction<Student[]>>;
  assignedClass: string | null;
  teacherName: string | null;
};

const TeacherContext = createContext<TeacherContextType | undefined>(undefined);

export function TeacherProvider({ children }: { children: ReactNode }) {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [assignedClass, setAssignedClass] = useState<string | null>(null);
  const [teacherName, setTeacherName] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const teacherInfo = await AsyncStorage.getItem("@teacher_info");

        if (teacherInfo) {
          try {
            const parsed = JSON.parse(teacherInfo);
            if (parsed.class && parsed.name) {
              setAssignedClass(parsed.class);
              setTeacherName(parsed.name);
            } else {
              await fetchAndSetTeacherClass();
            }
          } catch (err) {
            console.warn("Invalid teacher_info format:", err);
          }
        } else {
          await fetchAndSetTeacherClass();
        }

        const cachedData = await AsyncStorage.getItem("students");
        if (cachedData) {
          setStudents(JSON.parse(cachedData));
        }
      } catch (error) {
        console.error("Error initializing TeacherContext:", error);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  useEffect(() => {
    if (assignedClass) {
      refreshStudents();
    }
  }, [assignedClass]);

  const fetchAndSetTeacherClass = async () => {
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) return;

      const userDoc = await getDoc(doc(db, "users", currentUser.uid));
      if (userDoc.exists()) {
        const userData = userDoc.data();
        const userClass = userData?.class ?? null;
        setAssignedClass(userClass);
        setTeacherName(userData?.name ?? null);

        await AsyncStorage.setItem("@teacher_info", JSON.stringify(userData));
      } else {
        console.warn("Teacher document not found in Firestore");
      }
    } catch (err) {
      console.error("Error fetching teacher class:", err);
    }
  };

  const refreshStudents = async () => {
    try {
      if (!assignedClass) return;
      setLoading(true);
      const data = await fetchStudents(assignedClass);
      if (data) {
        setStudents(data);
        await AsyncStorage.setItem("students", JSON.stringify(data));
      }
    } catch (error) {
      console.error("Error refreshing students:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <TeacherContext.Provider
      value={{
        teacherName,
        students,
        studentCount: students.length,
        loading,
        refreshStudents,
        setStudents,
        assignedClass,
      }}
    >
      {children}
    </TeacherContext.Provider>
  );
}

export function useTeacher() {
  const context = useContext(TeacherContext);
  if (!context)
    throw new Error("useTeacher must be used within a TeacherProvider");
  return context;
}
