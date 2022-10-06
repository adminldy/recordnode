const Service = require("egg").Service

class UserService extends Service {
    async getUserByName(username) {
        const { app } = this
        try {
            const result = app.mysql.get('user', { username })
            return result
        }catch(error) {
            return null
        }
    }
    async register(params) {
        const { app } = this
        try {
            const result = await app.mysql.insert('user', params)
            return result
        }catch(error) {
            console.log(error)
            return null
        }
    }
    async editUserInfo(params) {
        const { app } = this
        console.log(`params`, params)
        try {
            const result = await app.mysql.update('user', {
                ...params
            }, {
                id: params.id
            })
            return result
        }catch(error) {
            console.log(error)
            return null
        }
    }
    async getUserList (pageIndex, pageSize) {
        const { ctx, app } = this
        const QUERY_STR = 'id, username'
        let sql = `select ${QUERY_STR} from user limit ?,?`
        try {
            // 根据分页查询数据库对应数据, 假如pageIndex = 2 ， pageSize = 3 则查询的第二页的数据，查的是索引为3到5的数据
            const result = await app.mysql.query(sql, [(pageIndex - 1) * pageSize, pageIndex * pageSize])
            return result
        }catch(error) {
            console.log(error)
            return null
        }
    }
    async deleteUser(user_id) {
        const { app } = this   
        let sql = `delete from user where id = ${user_id}`
        try {
            const result = await app.mysql.query(sql)
            return result
        }catch(error) {
            console.log(error)
            return null
        }
    }
}

module.exports = UserService