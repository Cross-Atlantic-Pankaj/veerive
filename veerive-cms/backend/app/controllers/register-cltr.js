import User from '../models/user-model.js'
import Profile from '../models/profile-model.js'
import bcryptjs from 'bcryptjs'

const registerCltr = {}

registerCltr.create = async (req, res) => {
    const {email, password, firstName, lastName, company, designation, country} = req.body

    try{
    const user = await User.findOne({email})
    if(user) {
        return res.status(404).json('user already exists')
    } 
    const userCount = await User.countDocuments()
    const userNew = new User({email, password})
    const salt = await bcryptjs.genSalt()
    const hash = await bcryptjs.hash(password, salt)
    userNew.password = hash
    if (userCount == 0){
        userNew.role = 'Admin'
    }
    await userNew.save()
    
    const profile = new Profile({firstName, lastName, userId: userNew._id, company, designation, country})
    await profile.save()
    return res.status(201).json({message:'new user registered successfully'})

    }catch(err) {
        console.error("Error:", err)
        res.status(500).json({message:'something went wrong'})
    }
}

export default registerCltr