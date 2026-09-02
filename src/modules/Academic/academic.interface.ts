export type TAcademicYear = {
  year: number;
  isCurrent?: boolean;
};

export type TAcademicClass = {
  name: string;
  code: string;
  academicYearId: string;
};

export type TAcademicSection = {
  name: string;
  capacity: number;
  classId: string;
};