import express from "express";
import { AuthRoutes } from "../modules/Auth/auth.route";
import { AcademicRoutes } from "../modules/Academic/academic.route";

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
];

moduleRoutes.forEach((route) => router.use(route.path, route.route));

export default router;
