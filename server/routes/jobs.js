import express from 'express'
import {
  getAllJobs,
  getJobById,
  createJob,
  updateJob,
  deleteJob,
  getMyJobs,
} from '../controllers/jobController.js'
import { protect, requireRole } from '../middleware/auth.js'

const router = express.Router()

// Public routes
router.get('/',           getAllJobs)
router.get('/my/listings', protect, requireRole('employer'), getMyJobs)
router.get('/:id',        getJobById)

// Protected routes (employer only for create/update/delete)
router.post('/',     protect, requireRole('employer'), createJob)
router.put('/:id',   protect, requireRole('employer'), updateJob)
router.delete('/:id', protect, requireRole('employer'), deleteJob)

export default router