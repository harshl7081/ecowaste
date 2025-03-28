import mongoose from 'mongoose';

const ProjectSchema = new mongoose.Schema({
  title: { 
    type: String, 
    required: true 
  },
  description: { 
    type: String, 
    required: true 
  },
  category: { 
    type: String, 
    required: true,
    enum: ['segregation', 'disposal', 'sanitization', 'other']
  },
  location: { 
    type: String, 
    required: true 
  },
  budget: { 
    type: Number, 
    required: true 
  },
  timeline: { 
    type: String, 
    required: true 
  },
  contactName: { 
    type: String, 
    required: true 
  },
  contactEmail: { 
    type: String, 
    required: true 
  },
  contactPhone: { 
    type: String, 
    required: false 
  },
  userId: { 
    type: String, 
    required: true 
  },
  userEmail: { 
    type: String, 
    required: true 
  },
  visibility: {
    type: String,
    enum: ['public', 'private', 'moderated'],
    default: 'moderated'
  },
  status: { 
    type: String, 
    default: 'pending',
    enum: ['pending', 'approved', 'in_progress', 'completed', 'rejected']
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  },
  updatedAt: { 
    type: Date, 
    default: Date.now 
  }
});

export default mongoose.models.Project || mongoose.model('Project', ProjectSchema); 