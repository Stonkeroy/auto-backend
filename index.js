import 'dotenv/config'
import express from 'express'
import multer from 'multer'
import cors from 'cors'
import mongoose from 'mongoose'
import { v2 as cloudinary } from 'cloudinary'
import { CloudinaryStorage } from 'multer-storage-cloudinary'

import { registerValidation, loginValidation, carCreateValidation } from './validations.js'
import { handleValidationErrors, checkAuth, checkAdmin } from './utils/index.js'
import { UserController, CarController, AIController } from './controllers/index.js'

// ── MongoDB ──────────────────────────────────────────────────
mongoose
  .connect(process.env.MONGO_URL)
  .then(() => console.log('DB ok'))
  .catch(() => console.log('DB error'))

// ── Cloudinary config ────────────────────────────────────────
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

// ── Multer → Cloudinary storage ──────────────────────────────
const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'auto-marketplace',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp', 'avif'],
    transformation: [{ width: 1200, crop: 'limit', quality: 'auto' }],
  },
})

const upload = multer({ storage })

// ── App ──────────────────────────────────────────────────────
const app = express()

// CORS має стояти ПЕРШИМ middleware, ще до express.json()
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}))

app.use(express.json())

// ── Auth ─────────────────────────────────────────────────────
app.post('/auth/login',    loginValidation,    handleValidationErrors, UserController.login)
app.post('/auth/register', registerValidation, handleValidationErrors, UserController.register)
app.get('/auth/me',        checkAuth,                                  UserController.getMe)

// ── Upload (тепер на Cloudinary) ─────────────────────────────
app.post('/upload', checkAuth, upload.array('images', 10), (req, res) => {
  const urls = req.files.map(f => f.path)
  res.json({ urls })
})

// ── Cars ─────────────────────────────────────────────────────
app.get('/cars',        CarController.getAll)
app.get('/cars/my',     checkAuth, CarController.getMyCars)
app.get('/cars/:id',    CarController.getOne)
app.post('/cars',       checkAuth, carCreateValidation, handleValidationErrors, CarController.create)
app.delete('/cars/:id', checkAuth, CarController.remove)
app.patch('/cars/:id',  checkAuth, carCreateValidation, handleValidationErrors, CarController.update)

// ── Admin ─────────────────────────────────────────────────────
app.get('/admin/cars',    checkAuth, checkAdmin, CarController.getPending)
app.patch('/admin/cars/:id', checkAuth, checkAdmin, CarController.moderate)

// ── AI ───────────────────────────────────────────────────────
app.post('/api/ai/chat',            AIController.chat)
app.post('/api/ai/chat-with-cars',  AIController.chatWithCars)

// ── Start ─────────────────────────────────────────────────────
app.listen(process.env.PORT || 4444, (err) => {
  if (err) return console.log(err);
  console.log(`Server started on port ${process.env.PORT || 4444}`);
})