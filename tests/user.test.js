const request=require('supertest')
const app=require('../src/app')
const User=require('../src/models/user')
const {_id,demoUser,setupDB}=require('./fixtures/db')
beforeEach(setupDB)
 test('signUp user test',async()=>{
     const res=await request(app).post('/user').send({
        name:'riyaz',
        password:'riyazsuhu',
        age:21,
        email:'riyazsuhu1999@gmail.com'
     }).expect(201)
     //assert that database is updated correctly
     const user=await User.findById(res.body.user._id)
     expect(user).not.toBeNull()
     //assert about responce
     expect(res.body).toMatchObject({
        user:{ name:'riyaz',
         email:'riyazsuhu1999@gmail.com'
     },token:user.tokens[0].token
    })
    expect(user.password).not.toBe('myypass')
 })
test('LogIn user test',async()=>{
    const res=await request(app).post('/user/login').send({
        email:demoUser.email,
        password:demoUser.password
    }).expect(200)
    const user=await User.findById(_id)
    expect(res.body.token).toBe(user.tokens[1].token)
})
test('Should not login non existent user',async()=>{
    await request(app).post('/user/login').send({
        email:demoUser.email,
        password:'dfsfhgdh'
    }).expect(400)
})
test('sould get profile of user',async()=>{
    await request(app).get('/user/me')
    .set('Authorization',`Bearer ${demoUser.tokens[0].token}`)
    .send().expect(200)
})
test('shoud not get token for unauthenticated user',async()=>{
    await request(app).get('/user/me').send().expect(404)
})
test('should delete user for authenticated user',async()=>{
    await request(app).delete('/user/me')
    .set('Authorization',`Bearer ${demoUser.tokens[0].token}`)
    .send().expect(200)
})
test('should not delete user for unauthencated user',async()=>{
    await await request(app).delete('/user/me').send().expect(404)
})
test('should upload avatar image',async()=>{
    await request(app).post('/user/me/avatar')
    .set('Authorization',`Bearer ${demoUser.tokens[0].token}`)
    .attach('image','tests/fixtures/about.jpg').expect(200)
    const user=await User.findById(_id)
    expect(user.avatar).toEqual(expect.any(Buffer))
})
test('should update valid user fields',async()=>{
 const res=await request(app).patch('/user/me')
 .set('Authorization',`Bearer ${demoUser.tokens[0].token}`)
 .send({name:'riyaz'}).expect(200)
 const user=await User.findById(_id)
 expect(user.name).toBe('riyaz')
})
test('should not update unauthencated user fields',async()=>{
    await request(app).patch('/user/me').send({location:7688})
    .set('Authorization',`Bearer ${demoUser.tokens[0].token}`)
    .expect(400)
})
