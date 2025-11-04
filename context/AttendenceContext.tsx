import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { getAttendance } from "@/services/attendenceServices";
import { useTeacher } from "@/context/TeacherContext";

interface AttendanceContextValue {
  todayRecord: AttendenceStudent[];
  presentCount: number;
  absentCount: number;
  attendanceRate: number;
  loading: boolean;
  refreshAttendance: () => Promise<void>;
}

// Default context value
const AttendanceContext = createContext<AttendanceContextValue>({
  todayRecord: [],
  presentCount: 0,
  absentCount: 0,
  attendanceRate: 0,
  loading: false,
  refreshAttendance: async () => {},
});

export const AttendanceProvider = ({ children }: { children: ReactNode }) => {
  const { assignedClass, studentCount } = useTeacher();
  const [todayRecord, setTodayRecord] = useState<AttendenceStudent[]>([]);
  const [loading, setLoading] = useState(true);
  const [presentCount, setPresentCount] = useState(0);
  const [absentCount, setAbsentCount] = useState(0);
  const [attendanceRate, setAttendanceRate] = useState(0);

  const fetchTodayAttendance = async () => {
    if (!assignedClass) return;
    try {
      setLoading(true);

      const today = new Date();
      const records: AttendanceRecord[] = await getAttendance({
        className: assignedClass,
        specificDay: today,
      });
      setTodayRecord(records);
      const present = records.filter((s) => s.status === "present").length;
      const absent = studentCount - present;

      setPresentCount(present);
      setAbsentCount(absent);
      setAttendanceRate(
        studentCount > 0 ? Math.round((present / studentCount) * 100) : 0,
      );
    } catch (err) {
      console.error("Failed to fetch attendance:", err);
      setTodayRecord([]);
      setPresentCount(0);
      setAbsentCount(0);
      setAttendanceRate(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTodayAttendance();
  }, [assignedClass, studentCount]);

  return (
    <AttendanceContext.Provider
      value={{
        todayRecord,
        presentCount,
        absentCount,
        attendanceRate,
        loading,
        refreshAttendance: fetchTodayAttendance,
      }}
    >
      {children}
    </AttendanceContext.Provider>
  );
};

// Custom hook
export const useAttendance = () => {
  const context = useContext(AttendanceContext);
  if (!context)
    throw new Error("useAttendance must be used within AttendanceProvider");
  return context;
};
