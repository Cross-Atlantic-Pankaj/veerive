import {Schema, model} from 'mongoose'

const driverSchema = new Schema({
    driverName: { type: String, required: true },
    driverDescription: { type: String, required: false },
    icon: { type: String, required: false }
}, {timestamps: true})

const Driver = model('Driver', driverSchema)

export default Driver
