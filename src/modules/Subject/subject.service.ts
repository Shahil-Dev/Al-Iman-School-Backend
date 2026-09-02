
import prisma from '../../lib/prisma';
import { TCreateSubjectPayload, TUpdateSubjectPayload } from './subject.interface';

const createSubjectIntoDB = async (payload: TCreateSubjectPayload) => {
  const result = await prisma.subject.create({
    data: payload,
    include: {
      class: true,
      teacher: true,
    },
  });
  return result;
};

const getAllSubjectsFromDB = async () => {
  const result = await prisma.subject.findMany({
    include: {
      class: true,
      teacher: true,
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
      teacher: true,
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
      teacher: true,
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