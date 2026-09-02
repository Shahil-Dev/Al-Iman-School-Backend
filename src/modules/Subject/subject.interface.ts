export type TCreateSubjectPayload = {
  name: string;
  code: string;
  fullMarks?: number;
  hasMT?: boolean;
  classId: string;
  teacherId?: string;
};