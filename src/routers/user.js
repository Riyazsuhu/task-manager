require('../db/mongoose')
const express=require('express')
const User=require('../models/user')
const multer=require('multer')
const auth=require('../middleware/auth')
const sharp=require('sharp')
const router=new express.Router()
router.post('/user',async(req,res)=>{
    const user=new User(req.body)
    try{
        const token=await user.generateAuthToken()
        res.status(201).send({user,token})
    }catch(e){
        res.status(400).send()
    }
})
router.get('/user/me',auth,async(req,res)=>{
    res.send(req.user)
})
router.get('/user/:id',async(req,res)=>{
    const _id=req.params.id
    try{
        const user=await User.findById(_id)
        if(!user){
            return res.status(404).send()
        }
        res.status(201).send(user)
    }catch(e){
        res.status(500).send()
    }
})
router.post('/user/login',async(req,res)=>{
    try{
    const user=await User.findByCredentials(req.body.email,req.body.password)
    const token=await user.generateAuthToken()
    res.send({user,token})
    }catch(e){
        res.status(400).send()
    }
})
router.post('/user/logout',auth,async(req,res)=>{
    try{
        req.user.tokens=req.user.tokens.filter((token)=>{
            return token.token !== req.token
        })
        await req.user.save()
        res.send()
    }catch(e){
        res.status(500).send()
    }
})
router.post('/user/sessionlogout',auth,async(req,res)=>{
    try{
        req.user.tokens=req.user.tokens.filter((token)=>{
            return token.token === req.token
        })
        await req.user.save()
        res.send()
    }catch(e){
        res.status(500).send()
    }
})
router.patch('/user/me',auth,async(req,res)=>{
    const updates=Object.keys(req.body)
    const allowedUpdates=['name','age','email','password']
    const isValidOperation= updates.every((update)=> allowedUpdates.includes(update))
    if(!isValidOperation){
        return res.status(400).send({error:'invalid updation'})
    }
    try{
        updates.forEach((update)=>req.user[update]=req.body[update])
        await req.user.save()
        res.send(req.user)
    }catch(e){
        res.status(500).send()
    }   
})
router.delete('/user/me',auth,async(req,res)=>{
    try{
        await req.user.remove()
        res.send(req.user)
    }catch(e){
        res.status(500).send()
    }
})
const upload=multer({limits:{
    fileSize:1000000
},fileFilter(req,file,cb){
    if(!file.originalname.match(/\.(jpg|jpeg|png)$/)){
        return cb(new Error('Invalid file format'))
    }
    cb(undefined,true)
}
})
router.post('/user/me/avatar',auth,upload.single('image'),async(req,res)=>{
    const buffer=await sharp(req.file.buffer).resize({height:250,width:250}).png().toBuffer()
    req.user.avatar=buffer
    await req.user.save()
    res.send()
},(err,req,res,next)=>{
    res.status(400).send({error:err.message})
})
router.delete('/user/me/avatar',auth,async(req,res)=>{
    req.user.avatar=undefined
    await req.user.save()
    res.send()
})
router.get('/user/:id/avatar',async(req,res)=>{
    try{
        const user=await User.findById(req.params.id)
        if(!user || !user.avatar){
            throw new Error()
        }
        res.set('Content-Type','image/jpg')
        res.send(user.avatar)
    }catch{
        res.status(404).send()
    }
})
module.exports=router


