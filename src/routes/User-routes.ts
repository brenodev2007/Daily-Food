import { Router } from "express";
import { UserController } from "@/controller/userController";
import { authenticate } from "@/middlewares/ensureAuthenticated";

export const userRoute = Router();
const userController = new UserController();

userRoute.post("/login", authenticate, userController.login);

userRoute.post("/cadastro", userController.cadastro);

userRoute.post("/refeicao", authenticate, userController.criarRefeicao);
