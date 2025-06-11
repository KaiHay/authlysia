import { Elysia, status } from "elysia";
import { pubMessage } from "./api/public";
import { protMessage } from "./api/protected";
import cors from "@elysiajs/cors";
import { swagger } from '@elysiajs/swagger'


const validApiKeys = new Set(['api-key-123', 'api-key-456'])


const app = new Elysia()
  // .derive({ as: 'local' }, (request) => {
  //   return { user: { name: 'kai', role: 'admin' }, isAuthenticated: true }
  // })
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
  .onBeforeHandle({ as: 'local' }, (request) => {
    const headers = request.headers
    const apiKey = headers['x-api-key']

    if (!apiKey) return status(401)
    const isAuthenticated = validApiKeys.has(apiKey)
    if (!isAuthenticated) return status(401)
  })
  .listen(3000)
  .get("/api/protected", () => protMessage())

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
);
