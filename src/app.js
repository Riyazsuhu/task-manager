const express=require('express')
const app=express()
const port=process.env.PORT
const userRouter=require('./routers/user')
const taskRouter=require('./routers/task')
app.use(express.json())
//RESTful API's
app.use(userRouter)
app.use(taskRouter)
app.listen(port,()=>{
    console.log('server started on port',port)
})