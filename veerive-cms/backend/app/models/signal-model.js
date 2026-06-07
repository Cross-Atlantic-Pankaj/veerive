import {Schema, model} from 'mongoose'

const signalSchema = new Schema ({
    signalName: { type: String, required: true },
    generalComment: { type: String, required: false },
}, {timestamps: true})

const subSignalSchema = new Schema ({
    subSignalName: { type: String, required: true },
    signalId: {type: Schema.Types.ObjectId, ref: 'Signal', required: true},
    generalComment: { type: String, required: false },
}, {timestamps: true})

const Signal = model('Signal', signalSchema)
const SubSignal = model('SubSignal', subSignalSchema)

export {Signal, SubSignal}