import jwt from "@elysiajs/jwt";
import Elysia from "elysia";
import 'dotenv/config'
import { cookie } from '@elysiajs/cookie'

export const jwtCreate = new Elysia()
  .use(jwt({
    name: 'jwt',
    secret: process.env.JWT_SECRET || 'thiswasnotmeanttobethesecretbutiguessitis'
  }))

export const cookieExpose = new Elysia()
  .use(cookie())

