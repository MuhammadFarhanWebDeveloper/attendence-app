import { db } from "@/lib/firebase";
import {
  collection,
  doc,
  onSnapshot,
  setDoc,
  query,
  where,
  getDocs,
  getCountFromServer,
} from "firebase/firestore";
import { sendUrduGroupMessage } from "./sendMessage";
/**
 * Submit attendance: stores one document per student per day
 */
export async function submitAttendance(
  className: string,
  students: AttendenceStudent[],
) {
  try {
    if (students.length === 0) throw new Error("No students to submit");

    const today = new Date();
    const dateString = today.toISOString().split("T")[0];
    const attendanceCollection = collection(db, "attendance");

    const promises = students.map((student) => {
      const { id, ...rest } = student;
      return setDoc(doc(attendanceCollection), {
        ...rest,
        studentId: id,
        class: className,
        date: dateString,
        createdAt: new Date(),
      });
    });

    await Promise.all(promises);

    console.log("Attendance submitted for all students!");
    return true;
  } catch (error) {
    console.error("Error submitting attendance:", error);
    throw error;
  }
}

export async function markAttendance(
  className: string,
  students: AttendenceStudent[],
) {
  const success = await submitAttendance(className, students);

  if (!success) return;

  const absentPhones = students
    .filter((student) => student.status === "absent" && student.phone)
    .map((student) => student.phone!);

  await sendUrduGroupMessage(absentPhones);
}
export async function getAttendance(
  options: AttendanceQueryOptions = {},
): Promise<AttendanceRecord[]> {
  try {
    const attendanceCollection = collection(db, "attendance");
    let q = query(attendanceCollection);

    if (options.className) {
      q = query(q, where("class", "==", options.className));
    }

    if (options.specificDay) {
      const dateString = options.specificDay.toISOString().split("T")[0];
      q = query(q, where("date", "==", dateString));
    }
    const snapshot = await getDocs(q);
    return snapshot.docs.map(
      (doc) => ({ id: doc.id, ...doc.data() }) as AttendanceRecord,
    );
  } catch (error) {
    console.error("Error fetching attendance:", error);
    throw error;
  }
}

export async function getAttendanceSummary(
  className?: string,
  specificDay?: Date,
): Promise<AttendanceSummary> {
  try {
    const attendanceCollection = collection(db, "attendance");

    let baseQuery = query(attendanceCollection);

    if (className) {
      baseQuery = query(baseQuery, where("class", "==", className));
    }

    if (specificDay) {
      const dateString = specificDay.toISOString().split("T")[0];
      baseQuery = query(baseQuery, where("date", "==", dateString));
    }

    const totalSnapshot = await getCountFromServer(baseQuery);
    const total = totalSnapshot.data().count;

    const presentQuery = query(baseQuery, where("status", "==", "present"));
    const presentSnapshot = await getCountFromServer(presentQuery);
    const present = presentSnapshot.data().count;

    const absent = total - present;
    const rate = total === 0 ? 0 : Math.round((present / total) * 100);

    return {
      className: className ?? "All Classes",
      date: specificDay ? specificDay.toISOString().split("T")[0] : "All Time",
      total,
      present,
      absent,
      rate,
    };
  } catch (err) {
    console.error("Error computing attendance summary from server:", err);
    throw err;
  }
}

export const listenToAttendanceRecords = (
  className: string | undefined,
  callback: (
    records: AttendanceRecord[],
    summary: { total: number; present: number; absent: number; rate: number },
  ) => void,
) => {
  const today = new Date().toISOString().split("T")[0];
  let attendanceQuery = query(
    collection(db, "attendance"),
    where("date", "==", today),
  );

  if (className) {
    attendanceQuery = query(attendanceQuery, where("class", "==", className));
  }

  const unsubscribe = onSnapshot(attendanceQuery, (snapshot) => {
    const records: AttendanceRecord[] = [];
    let present = 0;

    snapshot.forEach((doc) => {
      const data = doc.data() as AttendanceRecord;

      records.push(data);

      if (data.status === "present") present++;
    });

    const total = records.length;
    const absent = total - present;
    const rate = total === 0 ? 0 : Math.round((present / total) * 100);

    callback(records, { total, present, absent, rate });
  });

  return unsubscribe;
};

export async function getLowAttendanceStudents(
  month: number,
  year: number,
  className?: string,
) {
  const startOfMonth = new Date(year, month, 1);
  const endOfMonth = new Date(year, month + 1, 0);

  const startDate = startOfMonth.toISOString().split("T")[0];
  const endDate = endOfMonth.toISOString().split("T")[0];

  const attendanceRef = collection(db, "attendance");
  let q = query(
    attendanceRef,
    where("date", ">=", startDate),
    where("date", "<=", endDate),
  );

  if (className) {
    q = query(q, where("class", "==", className));
  }

  const snapshot = await getDocs(q);
  const records = snapshot.docs.map(
    (d) => ({ id: d.id, ...d.data() }) as AttendanceRecord,
  );

  const grouped: Record<string, AttendanceRecord[]> = {};
  for (const rec of records) {
    if (!grouped[rec.studentId]) grouped[rec.studentId] = [];
    grouped[rec.studentId].push(rec);
  }

  const results = Object.values(grouped).map((records) => {
    const student = records[0];
    const totalDays = records.length;
    const present = records.filter((r) => r.status === "present").length;
    const absent = totalDays - present;
    const rate = Math.round((present / totalDays) * 100);

    return {
      id: student.studentId,
      name: student.name,
      fathername: student.fathername,
      class: student.class,
      phone: student.phone,
      createdAt: student.createdAt,
      totalDays,
      present,
      absent,
      leaves: 0,
      attendanceRate: rate,
    };
  });

  return results.filter((r) => r.attendanceRate < 75);
}
