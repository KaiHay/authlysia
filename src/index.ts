import { Elysia, status, t } from "elysia";
import { pubMessage } from "./api/public";
import { protMessage } from "./api/protected";
import cors from "@elysiajs/cors";
import { swagger } from '@elysiajs/swagger'
import { users } from "./data/userdata";
import jwt from "@elysiajs/jwt";
import { loginApi } from "./api/login";
import cookie from "@elysiajs/cookie";
import 'dotenv/config'
import { jwtCreate } from "./tools/plugins";

const validApiKeys = new Set(['api-key-123', 'api-key-456'])


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
      }
    })
  )
  .use(cors({
    methods: ['GET', 'POST'],
    origin: '*'
  }))

  .get("/", () => "Hello Elysia", { detail: { tags: ['App'] } })

  .get("/api/public", (context) => { pubMessage(); console.log(context.request) })
  .use(jwtCreate)
  .use(loginApi)
  .get("/sign", async ({ jwt, request }) => {
    const headers = request.headers
    const name = headers.get('name')
    if (!name) return status(401)
    const now = Math.floor(Date.now() / 1000)
    const onehour = 60 * 60
    const value = await jwt.sign({ name: name, exp: now + onehour })
    users.push({ id: users.length + 1, username: name, secret: value, password: '11', role: 'admin' })
    console.log('new users:', users);

  })
  .onBeforeHandle({ as: 'local' }, async ({ jwt, request }) => {
    const headers = request.headers
    const rawtoken = headers.get('authorization')
    if (!rawtoken) return status(401)

    const [_, token] = rawtoken.split(' ')
    const jwtoken = await jwt.verify(token)
    console.log('Verified token: ', jwtoken);

    if (!jwtoken) return status(401)
    console.log('heres the jwt: ', jwtoken);

    let isAuthenticated = users.find((user) => user.username == jwtoken.name)
    console.log('should be an auth user: ', isAuthenticated)
    if (!isAuthenticated) return status(401)
    if (isAuthenticated.role != 'admin') return status(401)
  })
  .listen(3000)

  .get("/api/protected", () => protMessage())

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
);
export { jwtCreate };

