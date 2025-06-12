import { Elysia, status, t } from "elysia";
import { pubMessage } from "./api/public";
import { chatPoints, protMessage } from "./api/protected";
import cors from "@elysiajs/cors";
import { swagger } from '@elysiajs/swagger'
import { users } from "./data/userdata";
import { loginApi } from "./api/login";
import 'dotenv/config'
import { cookieExpose, jwtCreate } from "./tools/plugins";

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
  .use(cookieExpose)
  .onBeforeHandle({ as: 'local' }, async ({ jwt, request, cookie }) => {
    const headers = request.headers
    const rawtoken = cookie.authentication.value
    console.log('getting auth cookie: ', rawtoken);

    if (!rawtoken) return status(401)

    //const [_, token] = rawtoken.split(' ')
    console.log("need to verify");

    const jwtoken = await jwt.verify(rawtoken)
    console.log('jwtoken: ', jwtoken);

    if (!jwtoken) return status(401)

    console.log('Verified token: ', jwtoken);
    console.log('heres the jwt usename: ', jwtoken.username);

    let foundUser = users.find((user) => user.username == jwtoken.username)
    console.log('this is the user: ', foundUser)
    if (!foundUser) return
    let isAuthorized = false
    if (foundUser.role === 'admin') {
      isAuthorized = true
    }


    console.log('should be an auth user: ', isAuthorized)
    cookie.isAuthorized.set({ value: isAuthorized })

  })
  .use(chatPoints)
  .get("/api/protected", () => protMessage())


  .listen(3000)

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
);
export { jwtCreate };

