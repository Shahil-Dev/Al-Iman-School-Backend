import prisma from '../../lib/prisma';
import { TCreateSubjectPayload, TUpdateSubjectPayload } from './subject.interface';

// Outside the teacher pages only the name and designation are exposed
const teacherBrief = {
  select: {
    id: true,
    name: true,
    designation: true,
  },
} as const;

const createSubjectIntoDB = async (payload: TCreateSubjectPayload) => {
  const result = await prisma.subject.create({
    data: payload,
    include: {
      class: true,
      teacher: teacherBrief,
    },
  });
  return result;
};

const getAllSubjectsFromDB = async () => {
  const result = await prisma.subject.findMany({
    include: {
      class: true,
      teacher: teacherBrief,
    },
  });
  return result;
};

const getSubjectsByClassFromDB = async (classId: string) => {
  const result = await prisma.subject.findMany({
    where: {
      classId,
    },
    include: {
      teacher: teacherBrief,
    },
  });
  return result;
};

const updateSubjectIntoDB = async (id: string, payload: TUpdateSubjectPayload) => {
  const result = await prisma.subject.update({
    where: { id },
    data: payload,
    include: {
      class: true,
      teacher: teacherBrief,
    },
  });
  return result;
};

export const SubjectService = {
  createSubjectIntoDB,
  getAllSubjectsFromDB,
  getSubjectsByClassFromDB,
  updateSubjectIntoDB,
};