const Service = require('egg').Service
import moment from 'moment'
class BillService extends Service {
    async add(params) {
        const { ctx, app } = this
        try {
            const result = await app.mysql.insert('bill', params)
            return result
        }catch(error) {
            console.log(error)
            return null
        }
    }
    async list(id, {pageIndex = 1, pageSize = 10, date, type_id}) {
        const { ctx, app } = this
        const QUERY_STR = 'id, pay_type, amount, date, type_id, type_name, remark'
        const start = moment(date).startOf('month').format('YYYY-MM-DD')
        const end = moment(date).endOf('month').format('YYYY-MM-DD')
        let sql = `select ${QUERY_STR} from bill where user_id = ${id} and date between ${start} and ${end} and type_id = ${type_id} limit ?,?`
        try {
            const result = await app.mysql.query(sql, [(pageIndex - 1) * pageSize, pageIndex * pageSize])
            return result
        }catch(error) {
            console.log(error)
            return null
        }
    }
    async detail(id, user_id) {
        const { ctx, app } = this
        try {
           const result = await app.mysql.get('bill', { id, user_id })
           return result 
        }catch(error) {
            console.log(error)
            return null
        }
    }
    async update(params) {
        const { ctx, app } = this
        try {
            let result = await app.mysql.update('bill', {
                ...params
            }, {
                id: params.id,
                user_id: params.user_id
            })
        }catch(error) {
            console.log(error)
            return null
        }
    }
    async delete(id, user_id) {
        const { ctx, app } = this
        try {
            let result = app.mysql.delete({
                id,
                user_id
            })
            return result
        }catch(error) {
            console.log(`error`, error)
            return null
        }
    }
}

module.exports = BillService