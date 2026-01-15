import { Schema, model } from 'mongoose';

const userSchema = new Schema({
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true
    },
    ethnicity: {
        type: String,
        enum: ['ashkenazi', 'sephardi', 'teimani', 'other'],
        default: null
    },
    location: {
        type: {
            city: String,
            geonameId: Number,
            lat: Number,
            lng: Number,
            timezone: String,
            _id: false
        },
        default: null
    },
    special_onahs: {
        onat_ohrZarua: {
            type: Boolean,
            default: false
        },
        beinonit_on31: {
            type: Boolean,
            default: false
        }
    },
    preferences: {
        email_reminders: {
            type: Boolean,
            default: false
        }
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

export default model('User', userSchema);