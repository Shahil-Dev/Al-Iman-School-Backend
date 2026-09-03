export const calculateGrade = (totalMarks: number, fullMarks: number = 100) => {
  const percentage = (totalMarks / fullMarks) * 100;

  if (percentage >= 80) {
    return { grade: "A+", gradePoint: 5.0 };
  } else if (percentage >= 70) {
    return { grade: "A", gradePoint: 4.0 };
  } else if (percentage >= 60) {
    return { grade: "A-", gradePoint: 3.5 };
  } else if (percentage >= 50) {
    return { grade: "B", gradePoint: 3.0 };
  } else if (percentage >= 40) {
    return { grade: "C", gradePoint: 2.0 };
  } else if (percentage >= 33) {
    return { grade: "D", gradePoint: 1.0 };
  } else {
    return { grade: "F", gradePoint: 0.0 };
  }
};
