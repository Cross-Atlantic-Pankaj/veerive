import {Schema, model} from 'mongoose'

const storyOrderSchema = new Schema ({
    publishDate: { type: Date, required: false },  
    contextId: { type: Schema.Types.ObjectId, ref: 'Context', required: false},
    rank: { type: Number, required: false, min: 1 }     
}, {timestamps: true})

const StoryOrder = model('StoryOrder', storyOrderSchema)

export default StoryOrder
