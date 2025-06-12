
import Elysia, { status } from "elysia"
import { cookieExpose } from "../tools/plugins"
import cookie from "@elysiajs/cookie"


export const protMessage = () => {
    return { message: "Only admin should be able to see this" }
}


export const chatPoints = new Elysia({ prefix: '/api/chat' })
    .use(cookieExpose)
    .post('', async ({ cookie }) => {
        if (!cookie.isAuthorized.value) return status(401)
        console.log('someones posing a new chat');

        const authed = cookie.isAuthorized.value
        return 'good chat post'

    }, { detail: { tags: ['protected apis'] } })
    .get('/history', async ({ cookie }) => {
        if (!cookie.isAuthorized.value) return status(401)

        console.log('someones getting history');
        return 'heres the history: nothing'

    }, { detail: { tags: ['protected apis'] } })
    .delete('/history', async ({ cookie }) => {
        if (!cookie.isAuthorized.value) return status(401)
        console.log('someones deleting the history');
        return 'deleting history'

    }, { detail: { tags: ['protected apis'] } })