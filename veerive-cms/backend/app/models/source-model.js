import {Schema, model} from 'mongoose'

const sourceSchema = new Schema ({
    sourceName: { type: String, required: true },
    sourceType: { type: String, enum: ['News Site', 'Social Media Post', 'Professional Services Firm', 'Blog Site', 'Other'], required: true },
    generalComment: { type: String, required: false },
}, {timestamps: true})

const Source = model('Source', sourceSchema)

export default Source
