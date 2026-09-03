import prisma from "../../lib/prisma";

const createRoutineSlotInDB = async (payload: {
  day: string;
  startTime: string;
  endTime: string;
  classId: string;
  sectionId: string;
  subjectId: string;
  teacherId?: string;
}) => {
  const result = await prisma.classRoutine.create({
    data: payload,
    include: {
      class: true,
      section: true,
      subject: true,
    },
  });
  return result;
};

const getClassRoutineFromDB = async (classId: string, sectionId: string) => {
  const result = await prisma.classRoutine.findMany({
    where: {
      classId,
      sectionId,
    },
    include: {
      subject: true,
    },
    orderBy: { startTime: 'asc' },
  });
  return result;
};

export const RoutineService = {
  createRoutineSlotInDB,
  getClassRoutineFromDB,
};