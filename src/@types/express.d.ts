import "express";

declare module "express" {
  export interface Request {
    usuarioId?: string;
  }
}
