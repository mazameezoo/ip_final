import mongoose from 'mongoose'

const STATUSES = ['New', 'Review', 'Interview', 'Hired', 'Rejected']

const applicationSchema = new mongoose.Schema({
  job: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Job',
    required: true,
  },
  candidate: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  coverLetter: {
    type: String,
    trim: true,
    maxlength: [2000, 'Cover letter must be under 2000 characters'],
  },
  resume: {
    type: String, // URL or filename for now
    trim: true,
  },
  status: {
    type: String,
    enum: STATUSES,
    default: 'New',
  },
  matchScore: {
    type: Number,
    default: 0,
    min: 0,
    max: 100,
  },
}, {
  timestamps: true,
})

// Prevent duplicate applications (one application per candidate per job)
applicationSchema.index({ job: 1, candidate: 1 }, { unique: true })

const Application = mongoose.model('Application', applicationSchema)
export default Application