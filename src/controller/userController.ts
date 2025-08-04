import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import { prisma } from "@/database/prisma";
import { authConfig } from "@/middlewares/auth";
import bcrypt from "bcrypt";

import { z } from "zod";

export class UserController {
  login = async (req: Request, res: Response) => {
    const loginSchema = z.object({
      email: z.string().email(),
      password: z.string().min(6),
    });

    try {
      const { email, password } = loginSchema.parse(req.body);
      const user = await prisma.user.findUnique({
        where: { email },
      });

      if (!user) {
        return res.status(401).json({ error: "Email ou senha inválidos" });
      }
      //vai comparar a senhas
      const passwordMatch = await bcrypt.compare(password, user.password);

      if (!passwordMatch) {
        return res.status(401).json({ error: "Email ou senha inválidos" });
      }
      const token = jwt.sign(
        {
          email: user.email,
          role: user.role,
        },
        authConfig.jwt.secret,
        {
          subject: user.id,
          expiresIn: "1d",
        }
      );
      return res.json({ token });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Ops!" });
      }
      console.error(error);
      return res.status(500).json({ error: "Erro interno" });
    }
  };

  criarRefeicao = async (req: Request, res: Response) => {
    const criarRefeicaoSchema = z.object({
      nome: z.string().min(3),
      descricao: z.string().min(10),
      dataHora: z.coerce.date(),
      dentroDaDieta: z.boolean(),
      calorias: z.number().positive(),
      dietaId: z.string().uuid().optional(),
    });

    try {
      const { nome, descricao, dataHora, dentroDaDieta, calorias } =
        criarRefeicaoSchema.parse(req.body);
      const refeicao = await prisma.refeicao.create({
        data: {
          nome,
          descricao,
          dataHora,
          dentroDaDieta,
          calorias,
          dietaId: req.body.dietaId || null,
          usuarioId: req.usuarioId,
        },
      });
      return res.status(201).json(refeicao);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Dados inválidos" });
      }
      console.error(error);
      return res.status(500).json({ error: "Erro interno" });
    }
  };
}
