export type TAcademicYear = {
  year: number;
  isCurrent?: boolean;
};

export type TAcademicClass = {
  name: string;
  academicYearId: string;
};

export type TAcademicSection = {
  name: string;
  classId: string;
};

export type TAcademicSubject = {
  name: string;
  code: string;
  fullMarks?: number;
  hasMT?: boolean;
  classId: string;
  teacherId?: string;
};