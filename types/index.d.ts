export {};
declare global {
  type Student = {
    id?: string;
    name: string;
    fathername: string;
    class: string;
    phone: string;
  };
  type Teacher = {
    id?: string;
    class: string;
    createdAt: string;
    email: string;
    name: string;
    phone: string;
    role: "Teacher";
  };
}
