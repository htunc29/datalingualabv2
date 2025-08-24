import mongoose, { Schema } from 'mongoose';
import { Admin as IAdmin } from '@/types';

const AdminSchema = new Schema<IAdmin>({
  username: { 
    type: String, 
    required: true, 
    unique: true,
    trim: true
  },
  password: { 
    type: String, 
    required: true 
  }
}, {
  timestamps: true
});

export default mongoose.models.Admin || mongoose.model<IAdmin>('Admin', AdminSchema);