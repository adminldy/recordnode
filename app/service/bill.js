const moment = require('moment')
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
    async list(id, {pageIndex = 1, pageSize = 10, date = '', type_id = 0}) {
        const { ctx, app } = this
        let startDate
        let endDate
        if(date === '') {
            startDate = moment().startOf('month').format('YYYY-MM-DD hh:mm:ss'); 
            endDate = moment().endOf('month').format('YYYY-MM-DD hh:mm:ss');
        }else {
            startDate = moment(date).startOf('month').format('YYYY-MM-DD hh:mm:ss'); 
            endDate = moment(date).endOf('month').format('YYYY-MM-DD hh:mm:ss');
        }
        const QUERY_STR = 'id,pay_type,amount,date,type_id,type_name,remark'
        let sql = `select ${QUERY_STR} from bill where date between '${startDate}' and '${endDate}' and user_id=${id} ${type_id ? `and type_id=${type_id}` : ''} limit ?,?`
        console.log(`sql`, sql)
        let totalPage = `select count(*) from bill`
        try {
            const result = await app.mysql.query(sql, [(pageIndex - 1) * pageSize, pageIndex * pageSize])
            let result2 = await app.mysql.query(totalPage)
            return {
                list: result,
                totalPage: result2[0]['count(*)']
            }
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