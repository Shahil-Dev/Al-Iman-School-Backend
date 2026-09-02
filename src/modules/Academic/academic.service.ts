// import prisma from '../../../lib/prisma';
import prisma from '../../lib/prisma';
import { TAcademicClass, TAcademicSection, TAcademicYear } from './academic.interface';

// --- Academic Year Services ---
const createAcademicYear = async (payload: TAcademicYear) => {
  const result = await prisma.academicYear.create({
    data: payload,
  });
  return result;
};

const getAllAcademicYears = async () => {
  const result = await prisma.academicYear.findMany({
    orderBy: { year: 'desc' },
  });
  return result;
};

// --- Academic Class Services ---
const createAcademicClass = async (payload: TAcademicClass) => {
  const result = await prisma.class.create({
    data: payload as any,
  });
  return result;
};

const getAllAcademicClasses = async () => {
  const result = await prisma.class.findMany({
    include: { sections: true },
    orderBy: { createdAt: 'asc' },
  });
  return result;
};

// --- Academic Section Services ---
const createAcademicSection = async (payload: TAcademicSection) => {
  const result = await prisma.section.create({
    data: payload,
  });
  return result;
};

export const AcademicService = {
  createAcademicYear,
  getAllAcademicYears,
  createAcademicClass,
  getAllAcademicClasses,
  createAcademicSection,
};