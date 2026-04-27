import Profile from '../models/Profile.js'

const ensureProfile = async (userId) => {
  let profile = await Profile.findOne({ user: userId })
  if (!profile) {
    profile = await Profile.create({ user: userId })
  }
  return profile
}

export const getMyProfile = async (req, res) => {
  try {
    const profile = await ensureProfile(req.user._id)
    const populated = await profile.populate('user', 'firstName lastName email role company')
    res.json(populated)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

export const getProfileByUserId = async (req, res) => {
  try {
    const profile = await Profile.findOne({ user: req.params.userId })
      .populate('user', 'firstName lastName email role company')
    if (!profile) {
      return res.status(404).json({ message: 'Profile not found' })
    }
    res.json(profile)
  } catch (err) {
    if (err.name === 'CastError') {
      return res.status(400).json({ message: 'Invalid user ID' })
    }
    res.status(500).json({ message: err.message })
  }
}

export const updateMyProfile = async (req, res) => {
  try {
    const allowedFields = ['headline', 'location', 'school', 'about', 'cvName', 'cvUrl', 'skills', 'education', 'experience', 'links']
    const updates = {}
    for (const key of allowedFields) {
      if (key in req.body) updates[key] = req.body[key]
    }

    const profile = await ensureProfile(req.user._id)
    Object.assign(profile, updates)
    await profile.save()

    const populated = await profile.populate('user', 'firstName lastName email role company')
    res.json(populated)
  } catch (err) {
    if (err.name === 'ValidationError') {
      return res.status(400).json({ message: err.message })
    }
    res.status(500).json({ message: err.message })
  }
}

export const addEducation = async (req, res) => {
  try {
    const { degree, school, year } = req.body
    if (!degree || !school) {
      return res.status(400).json({ message: 'Degree and school are required' })
    }
    const profile = await ensureProfile(req.user._id)
    profile.education.push({ degree, school, year })
    await profile.save()
    res.status(201).json(profile.education[profile.education.length - 1])
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

export const deleteEducation = async (req, res) => {
  try {
    const profile = await ensureProfile(req.user._id)
    profile.education.id(req.params.itemId)?.deleteOne()
    await profile.save()
    res.json({ message: 'Education removed', id: req.params.itemId })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

export const addExperience = async (req, res) => {
  try {
    const { title, company, period } = req.body
    if (!title || !company) {
      return res.status(400).json({ message: 'Title and company are required' })
    }
    const profile = await ensureProfile(req.user._id)
    profile.experience.push({ title, company, period })
    await profile.save()
    res.status(201).json(profile.experience[profile.experience.length - 1])
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

export const deleteExperience = async (req, res) => {
  try {
    const profile = await ensureProfile(req.user._id)
    profile.experience.id(req.params.itemId)?.deleteOne()
    await profile.save()
    res.json({ message: 'Experience removed', id: req.params.itemId })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

export const addLink = async (req, res) => {
  try {
    const { title, url } = req.body
    if (!title || !url) {
      return res.status(400).json({ message: 'Title and URL are required' })
    }
    const profile = await ensureProfile(req.user._id)
    profile.links.push({ title, url })
    await profile.save()
    res.status(201).json(profile.links[profile.links.length - 1])
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

export const deleteLink = async (req, res) => {
  try {
    const profile = await ensureProfile(req.user._id)
    profile.links.id(req.params.itemId)?.deleteOne()
    await profile.save()
    res.json({ message: 'Link removed', id: req.params.itemId })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

export const addSkill = async (req, res) => {
  try {
    const { skill } = req.body
    if (!skill || !skill.trim()) {
      return res.status(400).json({ message: 'Skill name is required' })
    }
    const profile = await ensureProfile(req.user._id)
    const trimmed = skill.trim()
    if (!profile.skills.includes(trimmed)) {
      profile.skills.push(trimmed)
      await profile.save()
    }
    res.status(201).json({ skills: profile.skills })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

export const deleteSkill = async (req, res) => {
  try {
    const profile = await ensureProfile(req.user._id)
    profile.skills = profile.skills.filter(s => s !== req.params.skillName)
    await profile.save()
    res.json({ skills: profile.skills })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}