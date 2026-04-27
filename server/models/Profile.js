import mongoose from 'mongoose'

const educationSchema = new mongoose.Schema({
  degree: { type: String, required: true, trim: true },
  school: { type: String, required: true, trim: true },
  year:   { type: String, trim: true },
}, { _id: true, timestamps: true })

const experienceSchema = new mongoose.Schema({
  title:   { type: String, required: true, trim: true },
  company: { type: String, required: true, trim: true },
  period:  { type: String, trim: true },
}, { _id: true, timestamps: true })

const linkSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  url:   { type: String, required: true, trim: true },
}, { _id: true, timestamps: true })

const profileSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
  },
  headline: {
    type: String,
    trim: true,
    maxlength: 120,
    default: '',
  },
  location: {
    type: String,
    trim: true,
    maxlength: 100,
    default: '',
  },
  school: {
    type: String,
    trim: true,
    maxlength: 100,
    default: '',
  },
  about: {
    type: String,
    trim: true,
    maxlength: 1000,
    default: '',
  },
  cvName: {
    type: String,
    trim: true,
    default: null,
  },
  cvUrl: {
    type: String,
    trim: true,
    default: null,
  },
  skills: {
    type: [String],
    default: [],
  },
  education: {
    type: [educationSchema],
    default: [],
  },
  experience: {
    type: [experienceSchema],
    default: [],
  },
  links: {
    type: [linkSchema],
    default: [],
  },
}, {
  timestamps: true,
})

const Profile = mongoose.model('Profile', profileSchema)
export default Profile