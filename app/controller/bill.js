const Controller = require('egg').Controller;

const moment = require('moment')
class BillController extends Controller {
    async add() {
        const { ctx, app } = this
        // 获取请求中携带的参数
        const { amount, type_id, type_name, date, pay_type, remark = '' } = ctx.request.body
        if(!amount || !type_id || !type_name || !date || !pay_type) {
            ctx.body = {
                code: 400,
                msg: '参数错误',
                data: null
            }
        }
        try {
            let user_id
            const token = ctx.request.header.authorization
            // 根据token 获取用户信息 目的是获取对应的用户id 在新增账单的时候保存下来
            const decode = await app.jwt.verify(token, app.config.jwt.secret)
            if(!decode) return
            user_id = decode.id
            const result = await ctx.service.bill.add({
                amount,
                type_id,
                type_name,
                date,
                pay_type,
                remark,
                user_id
            })
            ctx.body = {
                code: 200,
                msg: '请求成功',
                data: null
            }
        }catch(error) {
            ctx.body = {
                code: 500,
                msg: '系统错误',
                data: null
            }
        }
    }
    async list() {
        const { ctx, app } = this
        // 获取分页的数据， type_id
        const { date, pageIndex = 1, pageSize = 10, type_id = 'all' } = ctx.query
        try {
            let user_id
            const token = ctx.request.header.authorization
            const decode = await app.jwt.verify(token, app.config.jwt.secret)
            if(!decode) return
            user_id = decode.id
            // 拿到当前用户的账单列表
            const list = await ctx.service.bill.list(user_id, pageIndex, pageSize)
            // 过滤出月份和类型所对应的账单列表
            const _list = list.filter(item => {
                if(type_id != 'all') {
                    return moment(Number(item.date)).format('YYYY-MM') == date && type_id == item.type_id
                }
                return moment(Number(item.date)).format('YYYY-MM') == date 
            })
            const listMap = _list.reduce((curr, item) => {
                const date = moment(Number(item.date)).format('YYYY-MM-DD')
                if(curr && curr.length && curr.findIndex(item => item.date === date) > -1) {
                    const index = curr.findIndex(item => item.date === date)
                    curr[index].bills.push(item)
                }
                if(curr && curr.length && curr.findIndex(item => item.date === date) == -1) {
                    curr.push({
                        date,
                        bills: [item]
                    })
                }
                if(!curr.length) {
                    curr.push({
                        date,
                        bills: [item]
                    })
                }
                return curr
            }, []).sort((a, b) => moment(b.date) - moment(a.date))
            // 获取当月所有账单列表
            let __list = list.filter(item => moment(Number(item.date)).format('YYYY-MM') == date)
            let totalExpense = __list.reduce((curr, item) => {
                if(item.pay_type === 1) {
                    curr += Number(item.amount)
                    return curr
                }
                return curr
            }, 0)
            let totalIncome = __list.reduce((curr, item) => {
                if(item.pay_type === 2) {
                    curr += Number(item.amount)
                    return curr
                }
                return curr
            })
            ctx.body = {
                code: 200,
                msg: '请求成功',
                data: {
                    totalExpense,
                    totalIncome,
                    totalPage
                }
            }
        }catch(error) {

        }
    }
}


module.exports = BillController;