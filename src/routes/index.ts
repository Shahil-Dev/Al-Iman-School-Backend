import express from "express";
import { AuthRoutes } from "../modules/Auth/auth.route";
import { AcademicRoutes } from "../modules/Academic/academic.route";
import { UserRoutes } from "../modules/User/user.route";
import { SubjectRoutes } from "../modules/Subject/subject.route";
import { MarkRoutes } from "../modules/Mark/mark.route";
import { ReviewRoutes } from "../modules/Review/review.route";
import { AttendanceRoutes } from "../modules/Attendance/attendance.route";

const router = express.Router();

const moduleRoutes = [
  {
    path: "/auth",
    route: AuthRoutes,
  },
  {
    path: "/academic",
    route: AcademicRoutes,
  },
  {
    path: "/users",
    route: UserRoutes,
  },
  {
    path: "/subjects",
    route: SubjectRoutes,
  },
  {
    path: "/marks",
    route: MarkRoutes,
  },
  {
    path: "/reviews",
    route: ReviewRoutes,
  },
  {
    path: "/attendances",
    route: AttendanceRoutes,
  },
];

moduleRoutes.forEach((route) => router.use(route.path, route.route));

export default router;
