import Application from '../models/Application.js'
import Job from '../models/Job.js'

// @desc    Apply to a job (candidate)
// @route   POST /api/applications
// @access  Private (candidate)
export const applyToJob = async (req, res) => {
  try {
    const { jobId, coverLetter, resume } = req.body

    if (!jobId) {
      return res.status(400).json({ message: 'Job ID is required' })
    }

    // Verify job exists and is active
    const job = await Job.findById(jobId)
    if (!job) {
      return res.status(404).json({ message: 'Job not found' })
    }
    if (job.status !== 'active') {
      return res.status(400).json({ message: 'This job is no longer accepting applications' })
    }

    // Prevent employer applying to their own job
    if (job.postedBy.toString() === req.user._id.toString()) {
      return res.status(400).json({ message: 'You cannot apply to your own job' })
    }

    // Generate a fake match score for now (real ML matching = future work)
    const matchScore = Math.floor(60 + Math.random() * 35)

    const application = await Application.create({
      job: jobId,
      candidate: req.user._id,
      coverLetter,
      resume,
      matchScore,
    })

    // Increment applicants counter on the job
    job.applicants = (job.applicants || 0) + 1
    await job.save()

    const populated = await application.populate([
      { path: 'job',       select: 'title company location type' },
      { path: 'candidate', select: 'firstName lastName email' },
    ])

    res.status(201).json(populated)
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ message: 'You have already applied to this job' })
    }
    if (err.name === 'ValidationError') {
      return res.status(400).json({ message: err.message })
    }
    if (err.name === 'CastError') {
      return res.status(400).json({ message: 'Invalid job ID' })
    }
    res.status(500).json({ message: err.message })
  }
}

// @desc    Get all applications by current candidate
// @route   GET /api/applications/me
// @access  Private (candidate)
export const getMyApplications = async (req, res) => {
  try {
    const apps = await Application.find({ candidate: req.user._id })
      .populate('job', 'title company location type status deadline')
      .sort({ createdAt: -1 })

    res.json(apps)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

// @desc    Get all applications for a specific job (employer-only, owner of job)
// @route   GET /api/applications/job/:jobId
// @access  Private (employer who owns job)
export const getApplicationsForJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.jobId)
    if (!job) {
      return res.status(404).json({ message: 'Job not found' })
    }
    if (job.postedBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to view applications for this job' })
    }

    const apps = await Application.find({ job: req.params.jobId })
      .populate('candidate', 'firstName lastName email')
      .populate('job', 'title')
      .sort({ createdAt: -1 })

    res.json(apps)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

// @desc    Get all applications across all employer's jobs
// @route   GET /api/applications/employer
// @access  Private (employer)
export const getEmployerApplications = async (req, res) => {
  try {
    const myJobs = await Job.find({ postedBy: req.user._id }).select('_id')
    const jobIds = myJobs.map(j => j._id)

    const apps = await Application.find({ job: { $in: jobIds } })
      .populate('candidate', 'firstName lastName email')
      .populate('job', 'title company')
      .sort({ createdAt: -1 })

    res.json(apps)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

// @desc    Update application status (employer)
// @route   PATCH /api/applications/:id/status
// @access  Private (employer who owns the job)
export const updateApplicationStatus = async (req, res) => {
  try {
    const { status } = req.body
    const validStatuses = ['New', 'Review', 'Interview', 'Hired', 'Rejected']

    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid status' })
    }

    const app = await Application.findById(req.params.id).populate('job')
    if (!app) {
      return res.status(404).json({ message: 'Application not found' })
    }

    if (app.job.postedBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this application' })
    }

    app.status = status
    await app.save()

    const populated = await app.populate('candidate', 'firstName lastName email')
    res.json(populated)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

// @desc    Withdraw application (candidate)
// @route   DELETE /api/applications/:id
// @access  Private (candidate who created it)
export const withdrawApplication = async (req, res) => {
  try {
    const app = await Application.findById(req.params.id)
    if (!app) {
      return res.status(404).json({ message: 'Application not found' })
    }
    if (app.candidate.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to withdraw this application' })
    }

    await app.deleteOne()

    // Decrement job applicants count
    await Job.findByIdAndUpdate(app.job, { $inc: { applicants: -1 } })

    res.json({ message: 'Application withdrawn', id: req.params.id })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}