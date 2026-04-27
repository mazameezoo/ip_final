import mongoose from 'mongoose'

const JOB_TYPES   = ['Full-time', 'Part-time', 'Contract', 'Remote', 'Hybrid']
const CATEGORIES  = ['Engineering', 'Design', 'Product', 'Analytics', 'Marketing', 'Sales', 'HR', 'Finance', 'Operations']
const EXP_LEVELS  = ['0–1 years', '1–2 years', '2–3 years', '3–5 years', '5+ years', '10+ years']
const STATUSES    = ['active', 'closed', 'draft']

const jobSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Job title is required'],
    trim: true,
    minlength: [3, 'Title must be at least 3 characters'],
    maxlength: [120, 'Title too long'],
  },
  company: {
    type: String,
    required: [true, 'Company name is required'],
    trim: true,
  },
  location: {
    type: String,
    required: [true, 'Location is required'],
    trim: true,
  },
  type: {
    type: String,
    enum: JOB_TYPES,
    required: true,
  },
  category: {
    type: String,
    enum: CATEGORIES,
    required: true,
  },
  experience: {
    type: String,
    enum: EXP_LEVELS,
    required: true,
  },
  salary: {
    type: String,
    required: [true, 'Salary range is required'],
    trim: true,
  },
  deadline: {
    type: Date,
    required: [true, 'Application deadline is required'],
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    minlength: [50, 'Description must be at least 50 characters'],
  },
  requirements: [{
    type: String,
    trim: true,
  }],
  skills: [{
    type: String,
    trim: true,
  }],
  status: {
    type: String,
    enum: STATUSES,
    default: 'active',
  },
  postedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  applicants: {
    type: Number,
    default: 0,
  },
  views: {
    type: Number,
    default: 0,
  },
}, {
  timestamps: true,
})

// Index for faster searches
jobSchema.index({ title: 'text', company: 'text', description: 'text' })
jobSchema.index({ status: 1, createdAt: -1 })

const Job = mongoose.model('Job', jobSchema)
export default Job