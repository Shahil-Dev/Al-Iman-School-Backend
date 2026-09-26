export type TSaveSingleMark = {
  studentId: string;
  mtMarks?: number;
  terminal: number;
};

export type TSaveMarkPayload = {
  examId: string;
  studentId: string;
  subjectId: string;
  mtMarks?: number;
  terminal: number;
};

export type TBulkSaveMarkPayload = {
  examId: string;
  subjectId: string;
  marks: TSaveSingleMark[];
};
