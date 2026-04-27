import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import helmet from 'helmet'
import rateLimit from 'express-rate-limit'
import mongoSanitize from 'express-mongo-sanitize'
import connectDB from './config/db.js'
import authRoutes from './routes/auth.js'
import jobRoutes from './routes/jobs.js'
import applicationRoutes from './routes/applications.js'
import postRoutes from './routes/posts.js'
import profileRoutes from './routes/profile.js'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 5000

app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
}))

app.use(cors({ origin: 'http://localhost:5173', credentials: true }))

app.use(express.json({ limit: '10kb' }))

app.use((req, res, next) => {
  if (req.body)  mongoSanitize.sanitize(req.body,  { replaceWith: '_' })
  if (req.params) mongoSanitize.sanitize(req.params, { replaceWith: '_' })
  next()
})

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { message: 'Too many login attempts. Please try again in 15 minutes.' },
  standardHeaders: true,
  legacyHeaders: false,
})

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  message: { message: 'Too many requests. Please slow down.' },
  standardHeaders: true,
  legacyHeaders: false,
})

app.use('/api/', apiLimiter)
app.use('/api/auth/login', authLimiter)
app.use('/api/auth/register', authLimiter)

app.get('/', (req, res) => {
  res.json({ message: 'TalentFlow API is running!' })
})

app.use('/api/auth', authRoutes)
app.use('/api/jobs', jobRoutes)
app.use('/api/applications', applicationRoutes)
app.use('/api/posts', postRoutes)
app.use('/api/profile', profileRoutes)

app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' })
})

app.use((err, req, res, next) => {
  console.error(err.stack)
  res.status(err.status || 500).json({
    message: err.message || 'Internal server error',
  })
})

connectDB()

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`)
})