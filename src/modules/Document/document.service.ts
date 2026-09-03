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
    },
  });

  if (!student) {
    throw new Error('Student not found!');
  }

  // QR Code Content generation for scanning verification
  const qrData = JSON.stringify({
    studentId: student.id,
    rollNo: student.rollNo,
    studentName: `${student.firstName} ${student.lastName}`,
    class: student.class?.className,
    guardianPhone: student.guardianPhone,
  });

  const qrCodeBase64 = await QRCode.toDataURL(qrData);

  return {
    idCardInfo: {
      studentId: student.id,
      rollNo: student.rollNo,
      fullName: `${student.firstName} ${student.lastName}`,
      gender: student.gender,
      bloodGroup: student.bloodGroup ,
      guardianName: student.guardianName,
      guardianPhone: student.guardianPhone,
      className: student.class?.className,
      sectionName: student.section?.sectionName,
      profileImage: student.profileImage || null,
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
    },
  });

  if (!student) {
    throw new Error('Student not found!');
  }

  return {
    studentName: `${student.firstName} ${student.lastName}`,
    fatherName: student.fatherName || student.guardianName,
    motherName: student.motherName || 'N/A',
    rollNo: student.rollNo,
    className: student.class?.className,
    session: student.session || new Date().getFullYear().toString(),
    dateOfBirth: student.dateOfBirth,
    issueDate: new Date(),
    status: 'Passed successfully with good moral character.',
  };
};

export const DocumentService = {
  getStudentIdCardDataFromDB,
  getTestimonialDataFromDB,
};