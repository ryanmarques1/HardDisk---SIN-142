import "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      nome: string | null;
      email: string | null;
      cpf: string | null;
      tel: string | null;
      data_nascimento: string | null;
    };
  }
}