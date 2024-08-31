import axios from "axios";
import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"

type NextAuthSession = {
  id: string;
  jwt: string;
  name: string;
  surname: string;
  image: any; 
  email: string;
  expiration: number
};

export default NextAuth({

  jwt: {
    signingKey: process.env.JWT_SIGNING_PRIVATE_KEY,
  },
  secret: process.env.NEXT_AUTH_SECRET,
  session: {
    jwt: true,
    maxAge: 30 * 24 * 60 * 60,
  },

  providers: [
    Credentials({
      name: 'Credentials',
      credentials: {},
      async authorize(credentials) {
        try{
          const url = process.env.NEXT_PUBLIC_AXIOS_URL + '/api/login';
          const response = await axios.post(url, credentials) 
          const jwt = response.data.data.jwt;
          const id = response.data.data[0].id;
          const name = response.data.data[0].name;
          const surname = response.data.data[0].surname;
          const image = response.data.data[0];
          const email = response.data.data[0].email;

            if (!jwt) {
              return null;
            }
            return {
              jwt,
              id,
              name,
              surname,
              image,
              email
            };
          } catch (e) {
            console.log(e);
            return null;
        }
      }
    })
  ],
  callbacks: {
    jwt: async (token: NextAuthSession, user: NextAuthSession) => {
      const isSignIn = !!user;
      const actualDateInSeconds = Math.floor(Date.now() / 1000);
      const tokenExpirationInSeconds = Math.floor(7 * 24 * 60 * 60);

      if (isSignIn) {
        if (!user || !user.jwt || !user.name || !user.email || !user.id ||!user.image) {
          return Promise.resolve({});
        }

        token.jwt = user.jwt;
        token.id = user.id;
        token.name = user.name;
        token.image = user.image;
        token.surname = user.name;
        token.email = user.email

        token.expiration = Math.floor(
          actualDateInSeconds + tokenExpirationInSeconds,
        );
      } else {
        if (!token?.expiration) return Promise.resolve({});

        if (actualDateInSeconds > token.expiration) return Promise.resolve({});

      }

      return Promise.resolve(token);
    },
    session: async (session: any, token: NextAuthSession) => {
      if (
        !token?.jwt ||
        !token?.id ||
        !token?.expiration ||
        !token?.email ||
        !token?.name ||
        !token?.image ||
        !token?.surname
      ) {
        return null;
      }

      session.accessToken = token.jwt;
      session.user = {
        id: token.id,
        name: token.name,
        surname: token.surname,
        email: token.email,
        image: token.image
       
      };

      return { ...session };
    },
  },
})