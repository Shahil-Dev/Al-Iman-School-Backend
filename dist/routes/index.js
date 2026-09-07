"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_route_1 = require("../modules/Auth/auth.route");
const academic_route_1 = require("../modules/Academic/academic.route");
const user_route_1 = require("../modules/User/user.route");
const subject_route_1 = require("../modules/Subject/subject.route");
const mark_route_1 = require("../modules/Mark/mark.route");
const review_route_1 = require("../modules/Review/review.route");
const attendance_route_1 = require("../modules/Attendance/attendance.route");
const payment_route_1 = require("../modules/Payment/payment.route");
const admission_route_1 = require("../modules/Admission/admission.route");
const exam_route_1 = require("../modules/Exam/exam.route");
const notice_route_1 = require("../modules/Notice/notice.route");
const routine_route_1 = require("../modules/Routine/routine.route");
const document_route_1 = require("../modules/Document/document.route");
const payroll_route_1 = require("../modules/Payroll/payroll.route");
const parent_route_1 = require("../modules/Parent/parent.route");
const admin_route_1 = require("../modules/Admin/admin.route"); // <--- Add this
const sMS_route_1 = require("../modules/SMS/sMS.route");
const router = express_1.default.Router();
const moduleRoutes = [
    {
        path: "/auth",
        route: auth_route_1.AuthRoutes,
    },
    {
        path: "/academic",
        route: academic_route_1.AcademicRoutes,
    },
    {
        path: "/users",
        route: user_route_1.UserRoutes,
    },
    {
        path: "/subjects",
        route: subject_route_1.SubjectRoutes,
    },
    {
        path: "/marks",
        route: mark_route_1.MarkRoutes,
    },
    {
        path: "/reviews",
        route: review_route_1.ReviewRoutes,
    },
    {
        path: "/attendances",
        route: attendance_route_1.AttendanceRoutes,
    },
    {
        path: "/payments",
        route: payment_route_1.PaymentRoutes,
    },
    {
        path: "/admissions",
        route: admission_route_1.AdmissionRoutes,
    },
    {
        path: "/exams",
        route: exam_route_1.ExamRoutes,
    },
    {
        path: "/notices",
        route: notice_route_1.NoticeRoutes,
    },
    {
        path: "/routines",
        route: routine_route_1.RoutineRoutes,
    },
    {
        path: "/documents",
        route: document_route_1.DocumentRoutes,
    },
    {
        path: "/payrolls",
        route: payroll_route_1.PayrollRoutes,
    },
    {
        path: "/parents",
        route: parent_route_1.ParentRoutes,
    },
    {
        path: "/admin",
        route: admin_route_1.AdminRoutes,
    },
    {
        path: "/notifications",
        route: sMS_route_1.MailNotificationRoutes,
    },
];
moduleRoutes.forEach((route) => router.use(route.path, route.route));
exports.default = router;
