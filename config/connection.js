const { MongoClient } = require('mongodb')

const url = process.env.MONGODB_URI || 'mongodb://localhost:27017'
const dbname = process.env.DB_NAME || 'shopping'

let state = {
    db: null
}

module.exports.connect = function(done) {
    MongoClient.connect(url)
        .then((client) => {
            state.db = client.db(dbname)
            console.log('DB Connected Successfully')
            done()
        })
        .catch((err) => {
            console.error('DB Connection Failed', err)
            done(err)
        })
}

module.exports.get = function() {
    return state.db
}