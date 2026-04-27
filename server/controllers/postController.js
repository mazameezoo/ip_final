import Post from '../models/Post.js'

export const getAllPosts = async (req, res) => {
  try {
    const { sort = 'recent' } = req.query

    const posts = await Post.find({})
      .populate('author', 'firstName lastName email role company')
      .populate('comments.author', 'firstName lastName email')
      .lean({ virtuals: true })

    if (sort === 'top') {
      posts.sort((a, b) => {
        const scoreA = (a.likes?.length || 0) + (a.comments?.length || 0) * 2
        const scoreB = (b.likes?.length || 0) + (b.comments?.length || 0) * 2
        return scoreB - scoreA
      })
    } else {
      posts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    }

    res.json(posts)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

export const createPost = async (req, res) => {
  try {
    const { content, tag } = req.body

    if (!content || !content.trim()) {
      return res.status(400).json({ message: 'Post content is required' })
    }

    const post = await Post.create({
      author: req.user._id,
      content: content.trim(),
      tag: tag || null,
    })

    const populated = await post.populate('author', 'firstName lastName email role company')
    res.status(201).json(populated)
  } catch (err) {
    if (err.name === 'ValidationError') {
      return res.status(400).json({ message: err.message })
    }
    res.status(500).json({ message: err.message })
  }
}

export const deletePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id)
    if (!post) {
      return res.status(404).json({ message: 'Post not found' })
    }
    if (post.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this post' })
    }
    await post.deleteOne()
    res.json({ message: 'Post deleted', id: req.params.id })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

export const toggleLike = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id)
    if (!post) {
      return res.status(404).json({ message: 'Post not found' })
    }

    const userId = req.user._id.toString()
    const idx = post.likes.findIndex(id => id.toString() === userId)

    if (idx === -1) {
      post.likes.push(req.user._id)
    } else {
      post.likes.splice(idx, 1)
    }

    await post.save()
    res.json({
      _id: post._id,
      likes: post.likes,
      likeCount: post.likes.length,
      liked: idx === -1,
    })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

export const addComment = async (req, res) => {
  try {
    const { text } = req.body
    if (!text || !text.trim()) {
      return res.status(400).json({ message: 'Comment text is required' })
    }

    const post = await Post.findById(req.params.id)
    if (!post) {
      return res.status(404).json({ message: 'Post not found' })
    }

    post.comments.push({
      author: req.user._id,
      text: text.trim(),
    })

    await post.save()
    const populated = await post.populate('comments.author', 'firstName lastName email')

    res.status(201).json(populated.comments[populated.comments.length - 1])
  } catch (err) {
    if (err.name === 'ValidationError') {
      return res.status(400).json({ message: err.message })
    }
    res.status(500).json({ message: err.message })
  }
}

export const deleteComment = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id)
    if (!post) {
      return res.status(404).json({ message: 'Post not found' })
    }

    const comment = post.comments.id(req.params.commentId)
    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' })
    }

    if (comment.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this comment' })
    }

    comment.deleteOne()
    await post.save()
    res.json({ message: 'Comment deleted', id: req.params.commentId })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}