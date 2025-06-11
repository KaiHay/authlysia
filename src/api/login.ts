import { Elysia, status, t } from "elysia";
import { users } from "../data/userdata";
import { jwtCreate, cookieExpose } from "../tools/plugins";

export const loginApi = new Elysia()

    .use(jwtCreate)
    .use(cookieExpose)
    .get('/api/login', ()=>'why u get from here')
    .post('/api/login', async ({ jwt, body: { username, password }, cookie }) => {
        const login = users.find((user) => user.username == username)

        if (!login) {
            return status(401)
        } else if (login.password != password) {
            return status(401)
        }
        const token=await jwt.sign({ username: username, password: password, })
        cookie.auth.set({value:token})
        return 'set cookie'
    }, {
        body: t.Object({
            username: t.String(),
            password: t.String()
        })
    })