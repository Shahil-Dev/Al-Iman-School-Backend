import { Request, Response } from 'express';
import { TeacherService } from './teacher.service';

const registerTeacher = async (req: Request, res: Response) => {
  try {
    const result = await TeacherService.registerTeacherIntoDB(req.body);
    res.status(201).json({
      success: true,
      statusCode: 201,
      message:
        'Teacher registration submitted successfully! Awaiting Admin Approval.',
      data: result,
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message || 'Teacher registration failed!',
    });
  }
};

const getPendingTeachers = async (req: Request, res: Response) => {
  try {
    const result = await TeacherService.getPendingTeachersFromDB();
    res.status(200).json({
      success: true,
      statusCode: 200,
      message: 'Pending teachers fetched successfully!',
      data: result,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch pending teachers',
    });
  }
};

const approveTeacher = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const result = await TeacherService.approveTeacherInDB(id as string);
    res.status(200).json({
      success: true,
      statusCode: 200,
      message: 'Teacher account approved successfully!',
      data: result,
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message || 'Failed to approve teacher',
    });
  }
};

const getAllTeachers = async (req: Request, res: Response) => {
  try {
    const result = await TeacherService.getAllTeachersFromDB();
    res.status(200).json({
      success: true,
      statusCode: 200,
      message: 'All approved teachers fetched successfully!',
      data: result,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch teachers',
    });
  }
};

export const TeacherController = {
  registerTeacher,
  getPendingTeachers,
  approveTeacher,
  getAllTeachers,
};