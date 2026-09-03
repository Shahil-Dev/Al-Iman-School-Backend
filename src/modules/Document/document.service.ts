import QRCode from 'qrcode';
import prisma from '../../lib/prisma';

const getStudentIdCardDataFromDB = async (studentId: string) => {
  const student = await prisma.studentProfile.findUnique({
    where: { id: studentId },
    include: {
      user: {
        select: {
          email: true,
        },
      },
      class: true,
      section: true,
      parent: true, 
    },
  });

  if (!student) {
    throw new Error('Student not found!');
  }

  const guardianName = student.parent
    ? `${student.parent.fatherName || student.parent.motherName || 'N/A'}`
    : 'N/A';
  const guardianPhone = student.parent?.phone || student.phone || 'N/A';

  // QR Code Content generation for scanning verification
  const qrData = JSON.stringify({
    studentId: student.id,
    studentIdNo: student.studentIdNo,
    rollNo: student.rollNo,
    studentName: `${student.firstName} ${student.lastName}`,
    class: student.class?.name,
    guardianPhone: guardianPhone,
  });

  const qrCodeBase64 = await QRCode.toDataURL(qrData);

  return {
    idCardInfo: {
      studentId: student.id,
      studentIdNo: student.studentIdNo,
      rollNo: student.rollNo,
      fullName: `${student.firstName} ${student.lastName}`,
      gender: student.gender,
      dob: student.dob,
      phone: student.phone || 'N/A',
      address: student.address || 'N/A',
      guardianName: guardianName,
      guardianPhone: guardianPhone,
      className: student.class?.name,
      sectionName: student.section?.name,
      profileImage: student.photoUrl || null,
      qrCode: qrCodeBase64,
    },
  };
};

const getTestimonialDataFromDB = async (studentId: string) => {
  const student = await prisma.studentProfile.findUnique({
    where: { id: studentId },
    include: {
      class: true,
      section: true,
      parent: true,
    },
  });

  if (!student) {
    throw new Error('Student not found!');
  }

  return {
    studentName: `${student.firstName} ${student.lastName}`,
    studentIdNo: student.studentIdNo,
    fatherName: student.parent?.fatherName || 'N/A',
    motherName: student.parent?.motherName || 'N/A',
    rollNo: student.rollNo,
    className: student.class?.name,
    session: new Date(student.createdAt).getFullYear().toString(),
    dateOfBirth: student.dob,
    issueDate: new Date(),
    status: 'Passed successfully with good moral character.',
  };
};

export const DocumentService = {
  getStudentIdCardDataFromDB,
  getTestimonialDataFromDB,
};