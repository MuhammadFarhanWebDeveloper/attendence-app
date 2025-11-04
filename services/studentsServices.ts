import { db } from "@/lib/firebase";
import {
  getCountFromServer,
  collection,
  deleteDoc,
  doc,
  getDocs,
  query,
  where,
} from "firebase/firestore";

export async function fetchStudents(className?: string): Promise<Student[]> {
  try {
    const studentsCol = collection(db, "students");

    // Build query: if className is provided, filter by class
    const q = className
      ? query(studentsCol, where("class", "==", className))
      : studentsCol;

    const querySnapshot = await getDocs(q);
    const students: Student[] = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...(doc.data() as Omit<Student, "id">),
    }));

    return students;
  } catch (error) {
    console.error("Error fetching students:", error);
    return [];
  }
}
export async function deleteStudent(id: string) {
  try {
    await deleteDoc(doc(db, "students", id));
    console.log(`Student ${id} deleted`);
    return true;
  } catch (error) {
    console.error("Error deleting student:", error);
    return false;
  }
}

export async function fetchNumberOfStudents(
  className?: string,
): Promise<number> {
  try {
    const studentsCol = collection(db, "students");
    let q = query(studentsCol);

    if (className) {
      q = query(studentsCol, where("class", "==", className));
    }

    const snapshot = await getCountFromServer(q);
    return snapshot.data().count;
  } catch (error) {
    console.error("Error fetching student count:", error);
    return 0;
  }
}
