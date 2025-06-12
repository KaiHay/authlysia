import { Elysia, status, t } from "elysia";
import { users } from "../data/userdata";
import { jwtCreate, cookieExpose } from "../tools/plugins";

export const loginApi = new Elysia()

    .use(jwtCreate)
    .use(cookieExpose)
    .get('/api/login', async ({ jwt, request }) => {
        const headers = request.headers
        const name = headers.get('name')
        if (!name) return status(401)
        const now = Math.floor(Date.now() / 1000)
        const onehour = 60 * 60
        const value = await jwt.sign({ name: name, exp: now + 30 })
        users.push({ id: users.length + 1, username: name, secret: value, password: '11', role: 'admin' })
        console.log('new users:', users);
    })
    .post('/api/login', async ({ jwt, body: { username, password }, cookie }) => {
        const login = users.find((user) => user.username == username)

        if (!login) {
            return status(401)
        } else if (login.password != password) {
            return status(401)
        }
        const token = await jwt.sign({ username: username, password: password, })
        cookie.auth.set({ value: token })
        return 'set cookie'
    }, {
        body: t.Object({
            username: t.String(),
            password: t.String()
        })
    })