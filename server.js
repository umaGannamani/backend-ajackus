const express = require('express')
const path = require('path')
const {open} = require('sqlite')
const sqlite3 = require('sqlite3')
const cors = require('cors')
const app = express()
app.use(express.json())
app.use(cors())
const dbPath = path.join(__dirname, 'user.db')
let db = null
const initializeDBandServer = async()=> {
    try {
        db = await open({
            filename: dbPath,
            driver: sqlite3.Database,
        })
        app.listen(3000, () => {
            console.log('Server Running http://localhost:3000/')
        })
    } catch (e) {
        console.log(`DB Error:${e.message}`)
        process.exit(1)
    }
}
initializeDBandServer()
const convertObjKeyPascalToCamel = userObject => {
    return {
        userName: userObject.user_name,
    }
}
const dbObjectToResponseObject = dbUserObject => {
    return {
        userId: dbUserObject.user_id,
        userFirstname: dbUserObject.user_firstname,
        userLastname: dbUserObject.user_lastname,
        userEmail: dbUserObject.user_email,
        userDepartment: dbUserObject.user_department,
    }
}

//API 1 
app.get('/users/', async (request, response) => {
    const getUserQuery = `
    SELECT 
    user_name
    FROM
    user;`
    const userArray = await db.all(getUserQuery)
    response.send(userArray.map(userDetails => convertObjKeyPascalToCamel(userDetails)),
)
})

//API 2
app.post('/user/', async(request, response)=> {
    const userDetails = request.body 
    const { userFirstname, userLastname, userEmail, userDepartment} = userDetails
    const addUserQuery = `
    INSERT INTO 
    user (user_id, user_firstname, user_lastname, user_email, user_department)
    VALUES ('${userId}', '${userFirstname}', '${userLastname}', '${userEmail}', '${userDepartment}'
    );`
    const dbResponse = await db.run(addUserQuery)
    const userId = dbResponse.lastID 
    response.send('User Successfully Added')
})

//API 3
app.get('/user/:userId/', async(request, response) => {
    const {userId} = request.params
    const getUserQuery1 = `
    SELECT 
    *
    FROM
    user
    WHERE 
    user_id = ${userId};`
    const userlist = await db.get(getUserQuery1)
    response.send(dbObjectToResponseObject(userlist))
})

//API 4

app.put('/user/:userId/', async(request, response) => {
    const {userId} = request.params
    const userDetails = request.body
    const {userFirstname, userLastname, userEmail, userDepartment} = userDetails
    const updateUserQuery = `
    UPDATE user
    SET 
    user_firstname = "${userFirstname}",
    user_lastname = "${userLastname}",
    user_email = "${userEmail}",
    user_department = "${userDepartment}"
    WHERE 
    user_id = ${userId};`
    await db.run(updateUserQuery)
    response.send('user details updated')
})

//API 5 
app.delete('/user/:userId/', async (request, response) => {
    const {userId} = request.params
    const deleteUserQuery = `
    DELETE
    FROM
    user
    WHERE
    user_id = ${userId};`
    await db.run(deleteUserQuery)
    response.send('user removed')
})

module.export = server
