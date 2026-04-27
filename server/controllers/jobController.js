import Job from '../models/Job.js'

// @desc    Get all jobs (with optional search/filters)
// @route   GET /api/jobs
// @access  Public
export const getAllJobs = async (req, res) => {
  try {
    const { search, type, category, status } = req.query

    const filter = {}
    if (status) filter.status = status
    else filter.status = 'active'

    if (type) filter.type = type
    if (category) filter.category = category

    if (search) {
      filter.$or = [
        { title:    { $regex: search, $options: 'i' } },
        { company:  { $regex: search, $options: 'i' } },
        { location: { $regex: search, $options: 'i' } },
      ]
    }

    const jobs = await Job.find(filter)
      .populate('postedBy', 'firstName lastName company email')
      .sort({ createdAt: -1 })

    res.json(jobs)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

// @desc    Get single job by ID
// @route   GET /api/jobs/:id
// @access  Public
export const getJobById = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id)
      .populate('postedBy', 'firstName lastName company email')

    if (!job) {
      return res.status(404).json({ message: 'Job not found' })
    }

    // Increment view count silently
    job.views += 1
    await job.save()

    res.json(job)
  } catch (err) {
    if (err.name === 'CastError') {
      return res.status(400).json({ message: 'Invalid job ID' })
    }
    res.status(500).json({ message: err.message })
  }
}

// @desc    Create a job
// @route   POST /api/jobs
// @access  Private (employer only)
export const createJob = async (req, res) => {
  try {
    const job = await Job.create({
      ...req.body,
      postedBy: req.user._id,
      company: req.body.company || req.user.company,
    })

    const populated = await job.populate('postedBy', 'firstName lastName company email')
    res.status(201).json(populated)
  } catch (err) {
    if (err.name === 'ValidationError') {
      return res.status(400).json({ message: err.message })
    }
    res.status(500).json({ message: err.message })
  }
}

// @desc    Update a job
// @route   PUT /api/jobs/:id
// @access  Private (job owner only)
export const updateJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id)

    if (!job) {
      return res.status(404).json({ message: 'Job not found' })
    }

    if (job.postedBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to edit this job' })
    }

    Object.assign(job, req.body)
    const updated = await job.save()
    res.json(updated)
  } catch (err) {
    if (err.name === 'ValidationError') {
      return res.status(400).json({ message: err.message })
    }
    res.status(500).json({ message: err.message })
  }
}

// @desc    Delete a job
// @route   DELETE /api/jobs/:id
// @access  Private (job owner only)
export const deleteJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id)

    if (!job) {
      return res.status(404).json({ message: 'Job not found' })
    }

    if (job.postedBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this job' })
    }

    await job.deleteOne()
    res.json({ message: 'Job removed', id: req.params.id })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

// @desc    Get jobs posted by current employer
// @route   GET /api/jobs/my/listings
// @access  Private (employer only)
export const getMyJobs = async (req, res) => {
  try {
    const jobs = await Job.find({ postedBy: req.user._id })
      .sort({ createdAt: -1 })
    res.json(jobs)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}