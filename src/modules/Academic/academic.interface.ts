export type TAcademicYear = {
  title: string; // e.g., "2026"
  code: string;  // e.g., "AY-2026"
  startDate: string;
  endDate: string;
};

export type TAcademicClass = {
  title: string; // e.g., "Class 10"
  code: string;  // e.g., "C10"
};

export type TAcademicSection = {
  title: string; // e.g., "Section A"
  capacity: number;
  classId: string;
};