import {Schema, model} from 'mongoose'

const imageSchema = new Schema({
    imageTitle: { type: String, required: true },
    imageLink: { type: String, required: true }
}, {timestamps: true})

const Image = model('Image', imageSchema)

export default Image
