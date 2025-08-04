import { Router } from "express";
import { UserController } from "@/controller/userController";
import { authenticate } from "@/middlewares/ensureAuthenticated";

export const userRoute = Router();
const userController = new UserController();

userRoute.post("/login", authenticate, userController.login);

userRoute.post("/cadastro", userController.cadastro);

userRoute.post("/refeicao", authenticate, userController.criarRefeicao);

userRoute.get("/listar-refeicao", authenticate, userController.listarRefeicoes);

userRoute.get("/listar-refeicao/:id", authenticate, userController.verRefeicao);

userRoute.put(
  "/editar-refeicao/:id",
  authenticate,
  userController.editarRefeicao
);

userRoute.delete(
  "/deletar-refeicao/:id",
  authenticate,
  userController.deletarRefeicao
);

userRoute.get(
  "/refeicoes/metricas",
  authenticate,
  userController.exibirMetricas
);
