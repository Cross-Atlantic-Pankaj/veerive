import {Schema, model} from 'mongoose'

const profileSchema = new Schema ({
    firstName: { type: String, required: true },
    lastName: { type: String, required: false },
    company: { type: String, required: false },
    designation: { type: String, required: false },
    userType: { type: String, enum: ['Paid', 'Free'], default: 'Free' },              // Type of user
    country: { type: Schema.Types.ObjectId, required: true },
    preferences: {
        postType: [{ type: Schema.Types.ObjectId, ref: 'PostType' }], // User content preferences (optional)
        sectors: [{ type: Schema.Types.ObjectId, ref: 'Sector' }],           // Preferred sectors (optional)
        countries: [{ type: Schema.Types.ObjectId, ref: 'Country' }],        // Preferred regions (optional)
        notifications: { type: Boolean, default: true }                               // Notification preference (optional)
      },
    userId: {type: Schema.Types.ObjectId, ref: 'User', required: true} 
}, {timestamps: true})

// Other fields
// oauthProvider: { type: String, required: true },           // e.g., 'google', 'linkedin'
// oauthId: { type: String, required: true, unique: true },  

const Profile = model('Profile', profileSchema)

export default Profile