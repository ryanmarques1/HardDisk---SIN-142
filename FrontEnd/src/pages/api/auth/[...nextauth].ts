import axios from "axios";
import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

type NextAuthSession = {
  id: string;
  jwt: string;
  nome: string;
  email: string;
  cpf: string;
  data_nascimento: string;
  tel: string;
  expiration: number;
};

export default NextAuth({
  secret: process.env.NEXT_AUTH_SECRET,

  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 dias
  },

  jwt: {
    secret: process.env.NEXT_AUTH_SECRET,
  },

  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {},
      async authorize(credentials) {
        try {
          if (!credentials) {
            throw new Error("As credenciais não foram fornecidas.");
          }

          const url = `http://127.0.0.1:8000/login`;
          const response = await axios.post(url, credentials)

          if (!response.data?.data) {
            throw new Error("Invalid response from login API");
          }

          const userData = response.data.data;
          const jwt = response.data.jwt;
          

          if (!jwt || !userData) {
            return null;
          }

          return {
            jwt,
            id: userData.id,
            nome: userData.nome,
            email: userData.email,
            cpf: userData.cpf,
            tel: userData.tel,
            data_nascimento: userData.data_nascimento,
          };
        } catch (error) {
          console.error("Error in authorize:", error);
          return null;
        }
      },
    }),
  ],

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.jwt = user.jwt;
        token.id = user.id;
        token.nome = user.nome;
        token.email = user.email;
        token.cpf = user.cpf;
        token.tel = user.tel;
        token.data_nascimento = user.data_nascimento;

        const actualDateInSeconds = Math.floor(Date.now() / 1000);
        const tokenExpirationInSeconds = 7 * 24 * 60 * 60;
        token.expiration = actualDateInSeconds + tokenExpirationInSeconds;
      }

      // Se o token expirou, zere todas as propriedades
      if (typeof token.expiration === "number" && Date.now() / 1000 > token.expiration) {
        return {
          jwt: "",
          id: "",
          nome: "",
          email: "",
          cpf: "",
          tel: "",
          data_nascimento: "",
          expiration: 0,
        }; 
      }

      return token;
    },

    async session({ session, token }) {
      // Verifique se todos os dados necessários estão presentes
      if (
        token?.jwt &&
        token?.id &&
        token?.email &&
        token?.nome &&
        token?.cpf &&
        token?.tel &&
        token?.data_nascimento
      ) {
        // Se estiverem presentes, atualize a sessão com esses dados
        session.accessToken = token.jwt;
        session.user = {
          id: (token.id).toString(),
          nome: (token.nome).toString(),
          email: (token.email).toString(),
          cpf: (token.cpf).toString(),
          tel: (token.tel).toString(),
          data_nascimento: (token.data_nascimento).toString(),
        };
      } else {
        // Zere os campos da sessão se o token estiver incompleto ou expirado
        session.accessToken = "";
        session.user = {
          id: "",
          nome: "",
          email: "",
          cpf: "",
          tel: "",
          data_nascimento: "",
        };
      }

      return session;
    },
  },
});
