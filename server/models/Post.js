import mongoose from 'mongoose'

const commentSchema = new mongoose.Schema({
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  text: {
    type: String,
    required: true,
    trim: true,
    minlength: 1,
    maxlength: 1000,
  },
}, { timestamps: true })

const postSchema = new mongoose.Schema({
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  content: {
    type: String,
    required: [true, 'Post content is required'],
    trim: true,
    minlength: [1, 'Post cannot be empty'],
    maxlength: [3000, 'Post too long'],
  },
  tag: {
    type: String,
    trim: true,
    default: null,
  },
  likes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  }],
  comments: [commentSchema],
  shares: {
    type: Number,
    default: 0,
  },
}, {
  timestamps: true,
})

postSchema.index({ createdAt: -1 })

postSchema.virtual('likeCount').get(function () {
  return this.likes?.length || 0
})

postSchema.virtual('commentCount').get(function () {
  return this.comments?.length || 0
})

postSchema.set('toJSON', { virtuals: true })
postSchema.set('toObject', { virtuals: true })

const Post = mongoose.model('Post', postSchema)
export default Post