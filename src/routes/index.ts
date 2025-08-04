import { Router } from "express";
import { userRoute } from "../routes/User-routes";

export const routes = Router();

routes.use("/client", userRoute);
