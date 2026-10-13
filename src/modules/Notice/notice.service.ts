import { NoticeTarget, Role } from "@prisma/client";
import prisma from "../../lib/prisma";

const createNoticeInDB = async (payload: {
  title: string;
  content: string;
  targetGroup?: NoticeTarget;
  attachment?: string;
}) => {
  const result = await prisma.notice.create({
    data: payload,
  });
  return result;
};

const getAllNoticesFromDB = async (userRole?: string, targetGroup?: string) => {
  const whereCondition: any = {};

  // 1. Role-based strict visibility filtering
  if (userRole === Role.STUDENT) {
    // Students can see ALL and STUDENTS notices
    whereCondition.targetGroup = { in: [NoticeTarget.ALL, NoticeTarget.STUDENTS] };
  } else if (userRole === Role.PARENT) {
    // Parents can see ALL, STUDENTS (for their kids), and PARENTS notices
    whereCondition.targetGroup = { in: [NoticeTarget.ALL, NoticeTarget.STUDENTS, NoticeTarget.PARENTS] };
  } else if (userRole === Role.TEACHER) {
    // Teachers can see ALL and TEACHERS notices
    whereCondition.targetGroup = { in: [NoticeTarget.ALL, NoticeTarget.TEACHERS] };
  } else {
    // For Admin / Super Admin or public queries, apply optional manual filter if provided
    if (
      targetGroup &&
      Object.values(NoticeTarget).includes(targetGroup as NoticeTarget)
    ) {
      whereCondition.targetGroup = targetGroup as NoticeTarget;
    }
  }

  const result = await prisma.notice.findMany({
    where: whereCondition,
    orderBy: { createdAt: "desc" },
  });
  return result;
};

const deleteNoticeFromDB = async (id: string) => {
  const result = await prisma.notice.delete({
    where: { id },
  });
  return result;
};

export const NoticeService = {
  createNoticeInDB,
  getAllNoticesFromDB,
  deleteNoticeFromDB,
};