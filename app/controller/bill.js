const Controller = require('egg').Controller;

const moment = require('moment')
class BillController extends Controller {
    // 添加订单
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
    // 获取订单列表
    async lists() {
        const { ctx, app } = this
        // 获取分页的数据， type_id
        const { date = '', pageIndex = 1, pageSize = 10, type_id = 0 } = ctx.query
        try {
            let user_id
            const token = ctx.request.header.authorization
            const decode = await app.jwt.verify(token, app.config.jwt.secret)
            if(!decode) return
            user_id = decode.id
            // 拿到当前用户的账单列表
            const {list, totalPage} = await ctx.service.bill.list(user_id, { date, pageIndex, pageSize, type_id })
            // 过滤出月份和类型所对应的账单列表
            const listMap = list.reduce((curr, item) => {
                const date = moment(item.date).format('YYYY-MM-DD')
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
            // 获取当月所有账单列表 pay_type === 1 为支出
            let totalExpense = list.reduce((curr, item) => {
                if(item.pay_type === 1) {
                    curr += Number(item.amount)
                    return curr
                }
                return curr
            }, 0)
            // pay_type === 2为收入
            let totalIncome = list.reduce((curr, item) => {
                if(item.pay_type === 2) {
                    curr += Number(item.amount)
                    return curr
                }
                return curr
            }, 0)
            ctx.body = {
                code: 200,
                msg: '请求成功',
                data: {
                    totalExpense,
                    totalIncome,
                    totalPage,
                    listMap
                }
            }
        }catch(error) {
            console.log(error)
            ctx.body = {
                code: 500,
                msg: '请求失败',
                data: error
            }
        }
    }
    // 获取订单详情
    async detail() {
        const { ctx, app } = this
        // 获取账单id参数
        const { id = '' } = ctx.query
        // 获取用户 user_id
        let user_id
        const token = ctx.request.header.authorization
        const decode = await app.jwt.verify(token, app.config.secret)
        if(!decode) return
        user_id = decode.id
        if(!id) {
            ctx.body = {
                code: 500,
                msg: '订单id不能为空',
                data: null
            }
            return
        }
        try {
            // 从数据库获取订单详情
            const detail = await ctx.service.bill.detail(id, user_id)
            ctx.body = {
                code: 200,
                msg: '请求成功',
                data: detail
            }
        }catch(error) {
            ctx.body = {
                code: 500,
                msg: '请求失败',
                data: null
            }
        }
    }
    // 编辑账单
    async update() {
        const { ctx, app } = this
        const { id, amount, type_id, type_name, date, pay_type, remark='' } = ctx.request.body
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
            const decode = await app.jwt.verify(token, app.config.jwt.secret)
            if(!decode) return
            user_id = decode.id
            const result = await ctx.service.bill.update({
                id, 
                amount, // 金额
                type_id, // 消费类型id
                type_name, // 消费类型名称
                date, // 日期
                pay_type, // 消费类型
                remark, //备注
                user_id // 用户id
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
    // 删除账单
    async delete() {
        const { ctx, app } = this
        const { id } = ctx.request.body
        if(!id) {
            ctx.bpdy = {
                code: 400,
                msg: '参数错误',
                data: null
            }
        }
        try {
            let user_id
            const token = ctx.request.header.authorization
            const decode = await app.jwt.verify(token, app.config.jwt.secret)
            if(!decode) return
            user_id = decode.id
            const result = await ctx.service.bill.delete(id, user_id)
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
    // 图表数据
    async data() {
        const { ctx, app } = this
        const { date = '' } = ctx.query
        try {
            const result = await ctx.service.bill.list(user_id, {date})
            // 总支出
            const total_expense = result.reduce((prev, cur) => {
                if(cur.pay_type === 1) {
                    prev += Number(cur.amount)
                }
            }, 0)
            // 总收入
            const total_income = result.reduce((prev, cur) => {
                if(cur.pay_type === 2) {
                    prev += Number(cur.amount)
                }
            }, 0)
            let total_data = _data.reduce((arr, cur) => {
                const index = arr.findIndex(item => item.type_id === cur.type_id)
                if(index === -1) {
                    arr.push({
                        type_id: cur.type_id,
                        type_name: cur.type_name,
                        pay_type: cur.pay_type,
                        number: Number(cur.amount)
                    })
                }
                if(index > -1) {
                    arr[index].number += Number(cur.amount)
                }
                return arr
            }, [])
          total_data = total_data.map(item => {
            item.number = Number(Number(item.number).toFixed(2))
            return item
          })
          ctx.body = {
            code: 200,
            msg: '请求成功',
            data: {
                total_expense: Number(total_expense).toFixed(2),
                total_income: Number(total_income).toFixed(2),
                total_data: total_data || []
            }
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


module.exports = BillController;