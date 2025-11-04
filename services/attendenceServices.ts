import { db } from "@/lib/firebase";
import {
  collection,
  doc,
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
    const dateString = today.toISOString().split("T")[0]; // yyyy-mm-dd
    const attendanceCollection = collection(db, "attendance");

    // Batch write one doc per student
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

  // Collect phone numbers of all absent students
  const absentPhones = students
    .filter((student) => student.status === "absent" && student.phone)
    .map((student) => student.phone!);

  // Send a single group SMS
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

/**
 * Compute summary: total present, absent, rate for a class/date
 */

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

    // Count total
    const totalSnapshot = await getCountFromServer(baseQuery);
    const total = totalSnapshot.data().count;

    // Count present
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
