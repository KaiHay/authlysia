import { Elysia } from "elysia";
import { pubMessage } from "./api/public";
import { protMessage } from "./api/protected";
import cors from "@elysiajs/cors";
import { swagger } from '@elysiajs/swagger'

const app = new Elysia()
  .use(
    swagger({
      path: '/api-docs',
      documentation: {
        info: {
          title: 'Elysia Documentation',
          version: '1.0.0'
        },
        tags: [
          { name: 'App', description: 'General endpoints' }
        ],
        // components: {
        //   securitySchemes: {
        //     bearerAuth: {
        //       type: 'http',
        //       scheme: 'bearer',
        //       bearerFormat: 'JWT'
        //     }
        //   }
        // }
      }
    })
  )
  .use(cors({
    methods: ['GET', 'POST'],
    origin: '*'
  }))
  .get("/", () => "Hello Elysia", { detail: { tags: ['App'] } })
  .get("/api/public", (context) => { pubMessage(); console.log(context.request) })
  .get("/api/protected", () => protMessage(),
    {
      beforeHandle({ status, headers }) {
        if (!headers.authorizations) {
          return status(401)
        }
      }
    })
  .listen(3000)
console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
);
