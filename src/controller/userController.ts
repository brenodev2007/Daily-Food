import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import { prisma } from "@/database/prisma";
import { authConfig } from "@/middlewares/auth";
import bcrypt from "bcrypt";

import { z } from "zod";

export class UserController {
  cadastro = async (req: Request, res: Response) => {
    const cadastroSchema = z.object({
      nome: z.string().min(3).max(50),
      email: z.string().email(),
      password: z.string().min(6),
    });

    try {
      const data = cadastroSchema.parse(req.body);

      const existingUser = await prisma.user.findUnique({
        where: { email: data.email },
      });

      if (existingUser) {
      }

      const hashedPassword = await bcrypt.hash(data.password, 10);

      const user = await prisma.user.create({
        data: {
          nome: data.nome,
          email: data.email,
          senha: hashedPassword,
        },
      });

      return res
        .status(201)
        .json({ message: "Usuário criado", userId: user.id });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.message });
      }

      return res.status(500).json({ error: "Erro interno" });
    }
  };

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
      const passwordMatch = await bcrypt.compare(password, user.senha);

      if (!passwordMatch) {
        return res.status(401).json({ error: "Email ou senha inválidos" });
      }
      const token = jwt.sign(
        {
          email: user.email,
          passord: user.senha,
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
          usuarioId: (req as any).usuarioId,
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

  listarRefeicoes = async (req: Request, res: Response) => {
    try {
      const refeicoes = await prisma.refeicao.findMany({
        where: { usuarioId: (req as any).usuarioId },
        orderBy: { dataHora: "desc" },
      });

      return res.json(refeicoes);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: "Erro interno" });
    }
  };

  verRefeicao = async (req: Request, res: Response) => {
    const id = req.params.id;
    try {
      const refeicao = await prisma.refeicao.findUnique({
        where: { id, usuarioId: (req as any).usuarioId },
      });

      if (!refeicao) {
        return res.status(404).json({ error: "Refeição não encontrada" });
      }

      return res.json(refeicao);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: "Erro interno" });
    }
  };

  editarRefeicao = async (req: Request, res: Response) => {
    const schema = z.object({
      nome: z.string(),
      descricao: z.string(),
      dataHora: z.coerce.date(),
      dentroDaDieta: z.boolean(),
      calorias: z.number().positive(),
    });

    try {
      const { id } = req.params;
      const data = schema.parse(req.body);

      const refeicao = await prisma.refeicao.findFirst({
        where: { id, usuarioId: (req as any).usuarioId },
      });

      if (!refeicao) {
        return res.status(404).json({ message: "Refeição não encontrada" });
      }

      const atualizada = await prisma.refeicao.update({
        where: { id },
        data,
      });

      return res.json(atualizada);
    } catch (error) {
      return res.status(400).json({ message: "Erro ao editar refeição" });
    }
  };

  deletarRefeicao = async (req: Request, res: Response) => {
    const { id } = req.params;

    try {
      const refeicao = await prisma.refeicao.findFirst({
        where: { id, usuarioId: (req as any).usuarioId },
      });

      if (!refeicao) {
        return res.status(404).json({ message: "Refeição não encontrada" });
      }

      await prisma.refeicao.delete({
        where: { id },
      });

      return res.status(204).send();
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: "Erro interno" });
    }
  };

  exibirMetricas = async (req: Request, res: Response) => {
    const usuarioId = (req as any).usuarioId;

    const [total, dentro, fora, refeicoes] = await Promise.all([
      prisma.refeicao.count({ where: { usuarioId } }),
      prisma.refeicao.count({ where: { usuarioId, dentroDaDieta: true } }),
      prisma.refeicao.count({ where: { usuarioId, dentroDaDieta: false } }),
      prisma.refeicao.findMany({
        where: { usuarioId },
        orderBy: { dataHora: "asc" },
      }),
    ]);

    let melhorSequencia = 0;
    let atual = 0;

    for (const r of refeicoes) {
      if (r.dentroDaDieta) {
        atual++;
        if (atual > melhorSequencia) melhorSequencia = atual;
      } else {
        atual = 0;
      }
    }

    return res.json({ total, dentro, fora, melhorSequencia });
  };
}
