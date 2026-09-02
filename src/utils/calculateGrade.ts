export const calculateGradeAndPoint = (totalObtained: number, fullMarks: number) => {
  // Convert score to percentage
  const percentage = (totalObtained / fullMarks) * 100;

  if (percentage >= 80) return { grade: 'A+', gradePoint: 5.0 };
  if (percentage >= 70) return { grade: 'A', gradePoint: 4.0 };
  if (percentage >= 60) return { grade: 'A-', gradePoint: 3.5 };
  if (percentage >= 50) return { grade: 'B', gradePoint: 3.0 };
  if (percentage >= 40) return { grade: 'C', gradePoint: 2.0 };
  return { grade: 'F', gradePoint: 0.0 };
};