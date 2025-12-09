import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },

    title: { type: String, required: true },
    message: { type: String, required: true },

    type: {
        type: String,
        enum: [
            'trip-assigned',
            'trip-status',
            'maintenance',
            'fuel',
            'tire',
            'info'
        ],
        default: 'info'
    },

    relatedId: { type: mongoose.Schema.Types.ObjectId }, // Trip or Vehicle or Tire etc.

    isRead: { type: Boolean, default: false },

    // realTime: { type: Boolean, default: false } // TRUE if sent via socket
}, {
    timestamps: true
});

export default mongoose.model('Notification', notificationSchema);
