import { Router } from "express";
import { UserController } from "@/controller/userController";
import { authenticate } from "@/middlewares/ensureAuthenticated";

export const userRoute = Router();
const userController = new UserController();

userRoute.post("/login", authenticate, userController.login);
