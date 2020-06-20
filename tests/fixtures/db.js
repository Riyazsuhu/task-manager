const jwt=require('jsonwebtoken')
const mongoose=require('mongoose')
const User=require('../../src/models/user')
const Task=require('../../src/models/task')
const _id=new mongoose.Types.ObjectId()
const _id2=new mongoose.Types.ObjectId()
const demoUser={
    _id,
    name:'demo',
    email:'demo@test.com',
    password:'demouser',
    tokens:[{
        token:jwt.sign({_id},process.env.JWT_SECRET)
    }]
}
const demoUser1={
    _id:_id2,
    name:'demo',
    email:'demo@test1.com',
    password:'demouser',
    tokens:[{
        token:jwt.sign({_id2},process.env.JWT_SECRET)
    }]
}
const demotask={
    _id:new mongoose.Types.ObjectId(),
    description:'task1',
    completed:true,
    owner:demoUser._id
}
const demotask1={
    _id:new mongoose.Types.ObjectId(),
    description:'task2',
    completed:false,
    owner:demoUser._id
}
const demotask2={
    _id:new mongoose.Types.ObjectId(),
    description:'task3',
    completed:false,
    owner:demoUser1._id
}
const setupDB=async()=>{
    await User.deleteMany()
    await Task.deleteMany()
    await new User(demoUser).save()
    await new User(demoUser1).save()
    await new Task(demotask).save()
    await new Task(demotask1).save()
    await new Task(demotask2).save()
}
module.exports={
    _id,
    demoUser,
    demoUser1,
    demotask,
    demotask1,
    demotask2,
    setupDB
}