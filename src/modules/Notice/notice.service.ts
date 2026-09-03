import { NoticeTarget } from '@prisma/client';
import prisma from '../../lib/prisma';

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

const getAllNoticesFromDB = async (targetGroup?: NoticeTarget) => {
  const whereCondition = targetGroup ? { targetGroup } : {};
  
  const result = await prisma.notice.findMany({
    where: whereCondition,
    orderBy: { publishedAt: 'desc' },
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