const Service = require('egg').Service

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
    async list(id, pageIndex, pageSize) {
        const { ctx, app } = this
        const QUERY_STR = 'id, pay_type, amount, date, type_id, type_name, remark'
        let sql = `select ${QUERY_STR} from bill where user_id = ${id} limit ?,?`
        try {
            const result = await app.mysql.query(sql, [(pageIndex - 1) * pageSize, pageIndex * pageSize])
            return result
        }catch(error) {
            console.log(error)
            return null
        }
    }
}

module.exports = BillService