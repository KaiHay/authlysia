import { Elysia, status, t } from "elysia";
import { users } from "../data/userdata";
import { jwtCreate, cookieExpose } from "../tools/plugins";

export const loginApi = new Elysia({ prefix: '/api' })

    .use(jwtCreate)
    .use(cookieExpose)
    .post('/signup', async ({ jwt, request, cookie }) => {
        const headers = request.headers
        const name = headers.get('username')
        const password = headers.get('password')
        if (!name) return status(401, 'Username Required')
        if (!password) return status(401, 'Password Required')

        const now = Math.floor(Date.now() / 1000)
        const onehour = 60 * 60
        const value = await jwt.sign({ Username: name, Password: password, exp: now + onehour })
        users.push({ id: users.length + 1, username: name, secret: value, password: password, role: 'admin' })
        console.log('new users:', users);
        cookie.authentication.set({ value: value })
        return 'Cookie Set'
    })
    .post('/login', async ({ jwt, body: { username, password }, cookie }) => {
        const foundUser = users.find((user) => user.username == username)
        console.log('looking for username: ', username);

        console.log('looking for: ', foundUser);

        if (!foundUser) {

            return status(401, "no username")
        } else if (foundUser.password != password) {
            return status(401, "notpassword")
        }
        const token = await jwt.sign({ username: username, password: password, })
        cookie.authentication.set({ value: token })

        return 'set cookie'
    }, {
        body: t.Object({
            username: t.String(),
            password: t.String()
        })
    })


// new Elysia().group('/api', (app) =>
//     app
//         .post('/signup', loginApi)
//         .post('/login', loginApi)
// )