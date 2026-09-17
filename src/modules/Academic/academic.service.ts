import prisma from '../../lib/prisma';
import {
  TAcademicClass,
  TAcademicSection,
  TAcademicSubject,
  TAcademicYear,
} from './academic.interface';

// --- Academic Year Services ---
const createAcademicYear = async (payload: TAcademicYear) => {
  return await prisma.academicYear.create({
    data: payload,
  });
};

const getAllAcademicYears = async () => {
  return await prisma.academicYear.findMany({
    orderBy: { year: 'desc' },
  });
};

// --- Academic Class Services ---
const createAcademicClass = async (payload: TAcademicClass) => {
  return await prisma.class.create({
    data: {
      name: payload.name,
      academicYearId: payload.academicYearId,
    },
  });
};

const getAllAcademicClasses = async () => {
  return await prisma.class.findMany({
    include: {
      academicYear: true,
      sections: true,  
      subjects: true, 
    },
    orderBy: {
      createdAt: 'desc',
    },
  });
};

// --- Academic Section Services ---
const createAcademicSection = async (payload: TAcademicSection) => {
  return await prisma.section.create({
    data: payload,
  });
};

const getAllAcademicSections = async () => {
  return await prisma.section.findMany({
    include: {
      class: true,
    },
    orderBy: {
      createdAt: 'desc',
    },
  });
};

// --- Academic Subject Services ---
const createAcademicSubject = async (payload: TAcademicSubject) => {
  return await prisma.subject.create({
    data: payload,
  });
};

const getAllAcademicSubjects = async () => {
  return await prisma.subject.findMany({
    include: {
      class: true,
      teacher: true,
    },
    orderBy: {
      createdAt: 'desc',
    },
  });
};

export const AcademicService = {
  createAcademicYear,
  getAllAcademicYears,
  createAcademicClass,
  getAllAcademicClasses,
  createAcademicSection,
  getAllAcademicSections,
  createAcademicSubject,
  getAllAcademicSubjects,
};