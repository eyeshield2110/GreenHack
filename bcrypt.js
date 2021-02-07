const bcrypt = require('bcrypt')


// Encrypting a password
const hashPassword = async (pw) => {
    const salt = await bcrypt.genSalt(12)
    const hash = await bcrypt.hash(pw, salt)
    console.log("salt: ", salt)
    console.log("hash: ", hash)
}

hashPassword('terrible_password')

// Checking the input password to the stored password
const login = async (pw, hashPassword) => {
    const result = await bcrypt.compare(pw, hashPassword)
    if (result)
        console.log("Successful login")
    else
        console.log("Wrong password")
}

login('terrible_password', "$2b$12$/FuioIMCGc5Ljl2OmE8izeBo.TSbpKu4Kke/Rv0mUkBXvKtl.J2oy")
