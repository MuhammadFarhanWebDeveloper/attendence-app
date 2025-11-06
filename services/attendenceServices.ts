import { db } from "@/lib/firebase";
import {
  collection,
  doc,
  onSnapshot,
  query,
  where,
  getDocs,
  getCountFromServer,
  increment,
  writeBatch,
} from "firebase/firestore";
import { sendUrduGroupMessage } from "./sendMessage";

export async function submitAttendance(
  className: string,
  students: AttendenceStudent[],
) {
  try {
    if (students.length === 0) throw new Error("No students to submit");

    const today = new Date();
    const dateString = today.toISOString().split("T")[0];
    const month = today.getMonth() + 1;
    const year = today.getFullYear();

    const attendanceCollection = collection(db, "attendance");
    const studentStatsCollection = collection(db, "studentStats");

    const attendanceBatch = writeBatch(db);

    students.forEach((student) => {
      const attendanceRef = doc(attendanceCollection);
      attendanceBatch.set(attendanceRef, {
        ...student,
        studentId: student.id,
        class: className,
        date: dateString,
        createdAt: new Date(),
      });
    });

    await attendanceBatch.commit();
    console.log("✅ Attendance records saved!");

    const summaryBatch = writeBatch(db);

    students.forEach((student) => {
      const summaryRef = doc(
        studentStatsCollection,
        `${student.id}_${year}_${month}`,
      );

      summaryBatch.set(
        summaryRef,
        {
          studentId: student.id,
          name: student.name,
          fathername: student.fathername,
          className: className,
          phone: student.phone || "",
          month,
          year,
          totalDays: increment(1),
          present: increment(student.status === "present" ? 1 : 0),
          updatedAt: new Date(),
        },
        { merge: true },
      );
    });

    await summaryBatch.commit();
    console.log(" Student summaries updated!");

    return true;
  } catch (error) {
    console.error("❌ Error submitting attendance:", error);
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

export async function getLowAttendanceStudents(
  month: number,
  year: number,
  className?: string,
): Promise<LowAttendanceStudent[]> {
  try {
    const statsRef = collection(db, "studentStats");

    let q = query(
      statsRef,
      where("month", "==", month),
      where("year", "==", year),
    );

    if (className) {
      q = query(q, where("className", "==", className));
    }

    const snapshot = await getDocs(q);
    const results: LowAttendanceStudent[] = [];

    snapshot.forEach((doc) => {
      const data = doc.data() as {
        studentId: string;
        name: string;
        fathername: string;
        className: string;
        phone?: string;
        totalDays?: number;
        present?: number;
        createdAt?: string;
      };

      const totalDays = data.totalDays || 0;
      const present = data.present || 0;
      const absent = totalDays - present;
      const rate =
        totalDays === 0 ? 0 : Math.round((present / totalDays) * 100);

      if (rate < 75) {
        results.push({
          id: data.studentId,
          name: data.name,
          fathername: data.fathername,
          class: data.className,
          phone: data.phone || "",
          createdAt: data.createdAt || new Date().toISOString(),
          present,
          absent,
          attendanceRate: rate,
        });
      }
    });

    console.log(` Found ${results.length} students below 75% attendance.`);
    return results;
  } catch (error) {
    console.error(" Error fetching low attendance students:", error);
    throw error;
  }
}
