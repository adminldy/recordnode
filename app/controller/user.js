const Controller = require('egg').Controller;
const defaultAvatar = 'http://s.yezgea02.com/1615973940679/WeChat77d6d2ac093e247c361f0b8a7aeb6c2a.png'

class UserController extends Controller {
    async register() {
        const { ctx } = this
        const { username, password } = ctx.request.body; // 获取注册需要的参数
        if(!username || !password) {
            ctx.body = {
                code: 500,
                msg: '账号密码不能为空',
                data: null
            }
            return
        }
        // 从数据库中查对应用户名
        const userInfo = await ctx.service.user.getUserByName(username)
        // 判断是否存在
        if(userInfo && userInfo.id) {
            ctx.body = {
                code: 500,
                msg: '用户名已被注册， 请重新输入',
                data: null
            }
            return
        }
        const result = await ctx.service.user.register({
            username,
            password,
            signature: '世界和平。',
            avatar: defaultAvatar
          });
          
          if (result) {
            ctx.body = {
              code: 200,
              msg: '注册成功',
              data: null
            }
          } else {
            ctx.body = {
              code: 500,
              msg: '注册失败',
              data: null
            }
          }
    }
    async login() {
        const { ctx, app } = this
        const { username, password } = ctx.request.body
        const userInfo = await ctx.service.user.getUserByName(username)
        // 说明没有找到该用户
        if(!userInfo || !userInfo.id) {
            ctx.body = {
                code: 500,
                msg: '账号不存在',
                data: null
            }
            return
        }
        // 找到用户， 判断输入密码和数据库中密码是否相同
        if(userInfo && userInfo.password !== password) {
            ctx.body = {
                code: 500,
                msg: '密码错误',
                data: null
            }
            return
        }
        // 生成token
        const token = app.jwt.sign({
            id: userInfo.id,
            username: userInfo.username,
            // 失效时间
            exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60) // token有效期为24小时
        }, app.config.jwt.secret)
        ctx.body = {
            code: 200,
            message: '登录成功',
            data: {
                token
            }
        }
    }
    async test() {
        const { ctx, app } = this
        // 通过token解析
        const token = ctx.request.header.authorization // 请求头获取 authorization 属性，值为 token
        // 通过 app.jwt.verify + 加密字符串 解析出 token 的值
        const decode = await app.jwt.verify(token, app.config.jwt.secret)
        ctx.body = {
            code: 200,
            message: '获取成功',
            data: {
                ...decode
            }
        }
    }
    // 获取用户信息
    async getUserInfo() {
        const { ctx, app } = this
        console.log(ctx, 'ctx')
        const token = ctx.request.header.authorization
        // 根据token解析出用户信息
        const decode = await app.jwt.verify(token, app.config.jwt.secret)
        const userInfo = await ctx.service.user.getUserByName(decode.username)
        ctx.body = {
            code: 200,
            msg: '请求成功',
            data: {
                id: userInfo.id,
                username: userInfo.username,
                signature: userInfo.signature || '',
                avatar: userInfo.avatar || defaultAvatar
            }
        }
    }
    // 编辑用户
    async editUserInfo() {
        const { ctx, app } = this
        const { signature = '' } = ctx.request.body
        try {
            let user_id
            const token = ctx.request.header.authorization
            const decode = await app.jwt.verify(token, app.config.jwt.secret)
            if(!decode) return
            user_id = decode.id
            const userInfo = await ctx.service.user.getUserByName(decode.username)
            const result = await ctx.service.user.editUserInfo(...userInfo, signature)
            ctx.body = {
                code: 200, 
                msg: '请求成功',
                data: {
                    id: user_id,
                    signature,
                    username: userInfo.username
                }
            }
        }catch(error) {
            
        }
    }
    // 获取用户列表
    async getUserList() {
        const { ctx } = this
        const { pageIndex = 1, pageSize = 10} = ctx.request.query
        try {
            let list =  await ctx.service.user.getUserList(pageIndex, pageSize)
            ctx.body = {
                code: 200,
                msg: '请求成功',
                data: list
            }
        }catch(error) {
            ctx.body = {
                code: 500,
                msg: '请求失败',
                data: null
            }
        }
    }
}

module.exports = UserController