import {Schema, model} from 'mongoose'

const postTypeSchema = new Schema ({
    postTypeName: { type: String, required: true },
    generalComment: { type: String, required: false },
}, {timestamps: true})

const PostType = model('PostType', postTypeSchema)

export default PostType
