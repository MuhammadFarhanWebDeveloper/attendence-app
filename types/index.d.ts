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
    date: string;
  }
  interface AttendanceQueryOptions {
    className?: string;
    month?: number;
    weekStart?: Date;
    weekEnd?: Date;
    specificDay?: Date;
    latest?: boolean;
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
    rate: number;
  }
  interface AcademicMonth {
    month: number;
    label: string;
    year: number;
  }
  interface LowAttendanceStudent extends Student {
    attendanceRate: number;
    present: number;
    absent: number;
    createdAt: string;
  }
}
