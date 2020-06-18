const mongoose=require('mongoose')
const validator=require('validator')
const bcrypt=require('bcryptjs')
const jwt=require('jsonwebtoken')
const Task=require('./task')
const userSchema= new mongoose.Schema({
    name:{
        type :String,
        trim:true
    },
    email:{
        type:String,
        trim:true,
        required:true,
        unique:true,
        lowercase:true,
        validate(value){
            if(!validator.isEmail(value)){
                throw new Error('invalid email address')
            }
        }
    },
    age:{
        type :Number,
        trim:true,
        default:0,
        validate(value){
            if(value<0){
                throw new Error('invalid age')
            }
        }
    },
    password:{
        type:String,
        trim:true,
        required:true,
        minlength:7,
        validate(value){
            if(value.toLowerCase()==='password'){
                throw new Error('Not allowed to use password as "password"')
            }
        }
    },
    tokens:[{token:{
        type:String,
        required:true
    }}],avatar:{
        type:Buffer
    }
},{
    timestamps:true
})
userSchema.virtual('tasks',{
    ref:'Task',
    localField:'_id',
    foreignField:'owner'
})
userSchema.methods.toJSON=function(){
    const user=this
    const userObject=user.toObject()
    delete userObject.password
    delete userObject.tokens
    delete userObject.avatar
    return userObject
}
userSchema.methods.generateAuthToken=async function(){
    const user=this
    const token= jwt.sign({_id:user._id.toString()},process.env.JWT_SECRET)
    user.tokens=user.tokens.concat({token})
    await user.save()
    return token
}
userSchema.statics.findByCredentials=async(email,password)=>{
    const user=await User.findOne({email})
    if(!user){
        throw new Error('Invalid email')
    }
    const isMatch=await bcrypt.compare(password,user.password)
    if(!isMatch){
        throw new Error('Invalid password')
    }
    return user
}
//hash the plain text password before saving
userSchema.pre('save',async function(next){
    const user=this
    if(user.isModified('password')){
        user.password=await bcrypt.hash(user.password,8)
    }
    next()
})
//delete a tasks when user deleted
userSchema.pre('remove',async function(next){
    const user=this
    await Task.deleteMany({owner:user._id})
    next()
})
const User=mongoose.model('User',userSchema)
module.exports=User