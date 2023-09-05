const cors = require('cors')
const express = require('express')
const app = express()
const config = require('./config')
app.use(cors())
const mongoose = require('mongoose')
mongoose.connect(config.dbConnection)
const authRoutes = require('../routes/auth')
const promptRoutes = require('../routes/prompt')
const answerRoutes = require('../routes/answer')
const conversationRoutes = require('../routes/conversation')
const userRoutes = require('../routes/user')
const SQLRoutes = require('../routes/SQL_questions')

app.use(express.json())
app.use("/auth",authRoutes)
app.use("/prompt",promptRoutes)
app.use("/answer",answerRoutes)
app.use("/conversation",conversationRoutes)
app.use("/user",userRoutes)
app.use("/SQL",SQLRoutes)
app.get('/', (req, res) => {
    res.send('Hello World from GET!')
})


app.listen(config.port, () => {
    console.log(`Example app listening on port ${config.port}`)
})