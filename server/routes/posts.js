import express from 'express'
import {
  getAllPosts,
  createPost,
  deletePost,
  toggleLike,
  addComment,
  deleteComment,
} from '../controllers/postController.js'
import { protect } from '../middleware/auth.js'

const router = express.Router()

router.get('/',                           getAllPosts)
router.post('/',                  protect, createPost)
router.delete('/:id',             protect, deletePost)
router.post('/:id/like',          protect, toggleLike)
router.post('/:id/comments',      protect, addComment)
router.delete('/:id/comments/:commentId', protect, deleteComment)

export default router