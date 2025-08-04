import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import { prisma } from "@/database/prisma";
import { authConfig } from "@/middlewares/auth";

import { z } from "zod";

export class UserController {
  login = async (req: Request, res: Response) => {
    const { email, senha } = req.body;

    const usuario = await prisma.user.findUnique({
      where: { email },
    });

    if (!usuario || usuario.senha !== senha) {
      return res.status(401).json({ message: "Credenciais inválidas" });
    }

    const token = jwt.sign({ id: usuario.id }, authConfig.jwt.secret, {
      expiresIn: "7d",
    });

    return res.json({ token });
  };
}
