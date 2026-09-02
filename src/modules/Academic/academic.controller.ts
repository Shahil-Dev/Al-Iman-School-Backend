import { Request, Response } from "express";
import { AcademicService } from "./academic.service";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";

const createAcademicYear = catchAsync(async (req: Request, res: Response) => {
  const result = await AcademicService.createAcademicYear(req.body);

  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: "Academic Year created successfully!",
    data: result,
  });
});

const getAllAcademicYears = catchAsync(async (req: Request, res: Response) => {
  const result = await AcademicService.getAllAcademicYears();

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Academic Years retrieved successfully!",
    data: result,
  });
});

const createAcademicClass = catchAsync(async (req: Request, res: Response) => {
  const result = await AcademicService.createAcademicClass(req.body);

  const createAcademicSection = catchAsync(
    async (req: Request, res: Response) => {
      const result = await AcademicService.createAcademicSection(req.body);

      sendResponse(res, {
        statusCode: 201,
        success: true,
        message: "Academic Section created successfully!",
        data: result,
      });
    },
  );

  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: "Academic Class created successfully!",
    data: result,
  });
});

const getAllAcademicClasses = catchAsync(
  async (req: Request, res: Response) => {
    const result = await AcademicService.getAllAcademicClasses();

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Academic Classes retrieved successfully!",
      data: result,
    });
  },
);

const createAcademicSection = catchAsync(
  async (req: Request, res: Response) => {
    const result = await AcademicService.createAcademicSection(req.body);

    sendResponse(res, {
      statusCode: 201,
      success: true,
      message: "Academic Section created successfully!",
      data: result,
    });
  },
);

export const AcademicController = {
  createAcademicYear,
  getAllAcademicYears,
  createAcademicClass,
  getAllAcademicClasses,
  createAcademicSection,
};
