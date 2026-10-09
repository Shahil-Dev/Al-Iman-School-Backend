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
    orderBy: { startTime: "asc" },
  });
  return result;
};

// 1. Update Routine Slot in DB
const updateRoutineSlotInDB = async (
  id: string,
  payload: Partial<{
    day: string;
    startTime: string;
    endTime: string;
    classId: string;
    sectionId: string;
    subjectId: string;
    teacherId?: string;
  }>
) => {
  const isExist = await prisma.classRoutine.findUnique({
    where: { id },
  });

  if (!isExist) {
    throw new Error("Routine slot not found!");
  }

  const result = await prisma.classRoutine.update({
    where: { id },
    data: payload,
    include: {
      class: true,
      section: true,
      subject: true,
    },
  });

  return result;
};

// 2. Delete Routine Slot from DB
const deleteRoutineSlotFromDB = async (id: string) => {
  const isExist = await prisma.classRoutine.findUnique({
    where: { id },
  });

  if (!isExist) {
    throw new Error("Routine slot not found!");
  }

  const result = await prisma.classRoutine.delete({
    where: { id },
  });

  return result;
};

export const RoutineService = {
  createRoutineSlotInDB,
  getClassRoutineFromDB,
  updateRoutineSlotInDB,
  deleteRoutineSlotFromDB,
};