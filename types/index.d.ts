export {};
declare global {
  interface Student {
    id: string;
    name: string;
    fathername: string;
    class: string;
    phone: string;
    createdAt: string;
  }
  interface Teacher {
    id: string;
    class: string;
    createdAt: string;
    email: string;
    name: string;
    phone: string;
    role: "Teacher";
  }
  type AttendanceStatus = "present" | "absent";

  interface AttendenceStudent extends Student {
    status: AttendanceStatus;
    date: string; // yyyy-mm-dd
  }
  interface AttendanceQueryOptions {
    className?: string; // Filter by class
    month?: number; // Month number 1-12
    weekStart?: Date; // Start of week
    weekEnd?: Date; // End of week
    specificDay?: Date; // Fetch a specific day
    latest?: boolean; // Fetch latest record
  }

  interface AttendanceRecord {
    id: string;
    studentId: string;
    name: string;
    fathername: string;
    class: string;
    phone: string;
    date: string;
    status: AttendanceStatus;
    createdAt: string;
  }
  interface AttendanceSummary {
    className: string;
    date: string;
    total: number;
    present: number;
    absent: number;
    rate: number; // percentage
  }
}
