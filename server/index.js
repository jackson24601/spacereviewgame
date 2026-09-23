import express from 'express'
import multer from 'multer'
import cors from 'cors'
import Papa from 'papaparse'
import { promises as fs } from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = express()
const PORT = 3001

app.use(cors())
app.use(express.json())

const uploadsDir = path.join(__dirname, 'uploads')
await fs.mkdir(uploadsDir, { recursive: true })

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir)
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    cb(null, uniqueSuffix + '-' + file.originalname)
  }
})

const upload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'text/csv' || file.originalname.endsWith('.csv')) {
      cb(null, true)
    } else {
      cb(new Error('Only CSV files are allowed'))
    }
  },
  limits: {
    fileSize: 5 * 1024 * 1024
  }
})

app.post('/api/upload', upload.single('csvFile'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' })
    }

    const filePath = req.file.path
    const fileContent = await fs.readFile(filePath, 'utf-8')

    Papa.parse(fileContent, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const terms = results.data
          .map(row => {
            const keys = Object.keys(row)
            if (keys.length < 2) return null
            
            const term = row[keys[0]]?.trim()
            const definition = row[keys[1]]?.trim()
            
            if (!term || !definition) return null
            
            return { term, definition }
          })
          .filter(item => item !== null)

        if (terms.length === 0) {
          return res.status(400).json({
            error: 'No valid terms found. Please ensure your CSV has at least two columns with terms and definitions.'
          })
        }

        const preview = terms.slice(0, 5)

        res.json({
          success: true,
          termCount: terms.length,
          preview: preview,
          filename: req.file.originalname
        })
      },
      error: (error) => {
        res.status(400).json({ error: 'Failed to parse CSV file: ' + error.message })
      }
    })
  } catch (error) {
    console.error('Upload error:', error)
    res.status(500).json({ error: 'Server error: ' + error.message })
  }
})

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' })
})

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`)
})
