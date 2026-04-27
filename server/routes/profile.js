import express from 'express'
import {
  getMyProfile,
  getProfileByUserId,
  updateMyProfile,
  addEducation,
  deleteEducation,
  addExperience,
  deleteExperience,
  addLink,
  deleteLink,
  addSkill,
  deleteSkill,
} from '../controllers/profileController.js'
import { protect } from '../middleware/auth.js'

const router = express.Router()

router.get('/me',                           protect, getMyProfile)
router.put('/me',                           protect, updateMyProfile)
router.get('/user/:userId',                          getProfileByUserId)

router.post('/me/education',                protect, addEducation)
router.delete('/me/education/:itemId',      protect, deleteEducation)

router.post('/me/experience',               protect, addExperience)
router.delete('/me/experience/:itemId',     protect, deleteExperience)

router.post('/me/links',                    protect, addLink)
router.delete('/me/links/:itemId',          protect, deleteLink)

router.post('/me/skills',                   protect, addSkill)
router.delete('/me/skills/:skillName',      protect, deleteSkill)

export default router