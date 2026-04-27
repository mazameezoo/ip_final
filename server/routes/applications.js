import express from 'express'
import {
  applyToJob,
  getMyApplications,
  getApplicationsForJob,
  getEmployerApplications,
  updateApplicationStatus,
  withdrawApplication,
} from '../controllers/applicationController.js'
import { protect, requireRole } from '../middleware/auth.js'

const router = express.Router()

// Candidate routes
router.post('/',                 protect, requireRole('candidate'), applyToJob)
router.get('/me',                protect, requireRole('candidate'), getMyApplications)
router.delete('/:id',            protect, requireRole('candidate'), withdrawApplication)

// Employer routes
router.get('/employer',          protect, requireRole('employer'), getEmployerApplications)
router.get('/job/:jobId',        protect, requireRole('employer'), getApplicationsForJob)
router.patch('/:id/status',      protect, requireRole('employer'), updateApplicationStatus)

export default router