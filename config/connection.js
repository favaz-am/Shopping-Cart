const { MongoClient } = require('mongodb')

const url = 'mongodb://localhost:27017'
const dbname = 'shopping'

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



