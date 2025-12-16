import axios from "axios";
import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import API from "@/config/API";

export const options: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET as string,
  pages: {
    signIn: "/login",
    signOut: "/signout",
  },
  session: {
    strategy: "jwt",
    maxAge: 60 * 60 * 24 * 7,
  },
  providers: [
    CredentialsProvider({
      id: "credentials",
      name: "Credentials",
      type: "credentials",
      credentials: {
        email: {
          type: "text",
        },
        password: {
          type: "password",
        },
      },
      async authorize(credentials: any): Promise<any> {
        try {
          const loginUrl = API.BASE_URL + API.LOGIN_EMAIL;
          console.log("NextAuth Login URL:", loginUrl);
          console.log("Login credentials:", credentials);

          // Extract only required and optional fields for backend
          const loginData: any = {
            email: credentials?.email,
            password: credentials?.password,
          };

          // Add optional FCM tokens if available (for push notifications)
          if (credentials?.fcmtoken) {
            loginData.fcmtoken = credentials.fcmtoken;
          }
          if (credentials?.seller_fcmtoken) {
            loginData.seller_fcmtoken = credentials.seller_fcmtoken;
          }

          console.log("Sending to backend:", loginData);

          const response = await axios.post(loginUrl, loginData, {
            headers: { "Content-Type": "application/json" },
            timeout: 60000, // 60 second timeout
          });
          console.log("Login response:", response.data);
          return response.data;
        } catch (error: any) {
          console.error("NextAuth Login Error:", error.message);
          console.error("Error details:", error?.response?.data);
          throw new Error(error?.response?.data?.message || "Login Failed.");
        }
      },
    }),
    CredentialsProvider<any>({
      id: "google",
      name: "ID Token",
      credentials: {
        idToken: {
          idToken: "idToken",
          type: "text",
        },
      },
      async authorize(credentials): Promise<any> {
        try {
          const response = await axios.post(
            API.BASE_URL + API.LOGIN_GMAIL,
            credentials,
            { headers: { "Content-Type": "application/json" } }
          );
          return response.data;
        } catch (error: any) {
          throw new Error(error?.response?.data?.message || "Login Failed.");
        }
      },
    }),
    CredentialsProvider<any>({
      id: "phone",
      name: "Phone Login",
      credentials: {
        idToken: {
          idToken: "idToken",
          type: "text",
        },
        code: {
          code: "code",
          type: "text",
        },
      },
      async authorize(credentials): Promise<any> {
        try {
          const response = await axios.post(
            API.BASE_URL + API.LOGIN_PHONE,
            credentials,
            { headers: { "Content-Type": "application/json" } }
          );
          return response.data;
        } catch (error: any) {
          throw new Error(error?.response?.data?.message || "Login Failed.");
        }
      },
    }),
  ],
  callbacks: {
    async signIn({ user }: any) {
      //checking if the user is deactivated or not
      console.log("=== NEXTAUTH SIGNIN CALLBACK ===");
      console.log("Full user object:", JSON.stringify(user, null, 2));
      console.log("User keys:", Object.keys(user || {}));
      console.log("User?.data:", JSON.stringify(user?.data, null, 2));
      console.log("User?.data?.status:", user?.data?.status);
      console.log("User?.status:", user?.status);
      console.log("Type of user?.data?.status:", typeof user?.data?.status);

      // Check multiple possible status locations
      const status = user?.data?.status ?? user?.status;
      console.log("Final status value:", status);
      console.log("Is status truthy:", !!status);

      if (user?.data?.status) {
        console.log("Sign in SUCCESS - user.data.status is truthy");
        return true;
      }

      // Fallback: check if user object exists and has data
      if (user?.data) {
        console.log("Sign in SUCCESS - user.data exists, allowing login");
        return true;
      }

      console.log("Sign in FAILED - no valid user data found");
      return false;
    },

    async jwt({ token, user, account, trigger, session }: any) {
      if (user) {
        token.user = user?.data;
        token.token = user?.token;
        token.refreshToken = user?.refreshToken;

        // token = user; // Save token to the JWT token
      }
      if (trigger === "update" && session) {
        // Update user data in the token
        token.user = {
          ...token.user,
          ...session.user,
        };
      }
      return token;
    },

    async session({ session, token, user }: any) {
      if (token) {
        session.token = token?.token;
        session.refreshToken = token?.refreshToken;
        session.role = token?.user?.role;
        session.type = token?.user?.type;
        session.user = {
          name: token?.user?.name,
          email: token?.user?.email,
          image: token?.user?.image,
          mail_verify: token?.user?.mail_verify,
          phone_verify: token?.user?.phone_verify,
          status: token?.user?.status,
          first_name: token?.user?.first_name,
          last_name: token?.user?.last_name,
          wishlist: token?.user?.wishlist,
          notifications: token?.user?.notifications,
          store_id: token?.user?.store_id,
          user_name: token?.user?.username,
          phone: token?.user?.phone,
          countrycode: token?.user?.countrycode,
          type: token?.user?.type,
        };
      }
      return session;
    },
  },
};
