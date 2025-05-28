const express = require('express');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const app = express();

// Ensure upload directory exists
const uploadDir = path.join(__dirname, 'uploads'); // Changed to correct uploads folder path
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const materials = [];

// Multer setup for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '_' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});
const upload = multer({ storage: storage });

// Upload route to handle file and link uploads
app.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    console.error('Multer error:', err);
    return res.status(400).json({ message: 'Multer error', error: err.message });
  }
  next(err);
});

app.post('/upload', (req, res, next) => {
  console.log('Upload route hit - before multer');
  next();
}, upload.single('file'), (req, res) => {
  console.log('Upload route hit - after multer');
  console.log('req.file:', req.file);
  console.log('req.body:', req.body);
  try {
    if (req.file) {
      console.log('Processing file upload...');
      // File upload
      const newMaterial = {
        id: materials.length + 1,
        title: req.file.originalname,
        type: path.extname(req.file.originalname).substring(1).toUpperCase(),
        dateAdded: new Date().toISOString().split('T')[0],
        size: (req.file.size / (1024 * 1024)).toFixed(2) + ' MB',
        url: `/uploads/${req.file.filename}`
      };
      materials.push(newMaterial);
      console.log('File uploaded successfully:', newMaterial);
      res.status(201).json({ message: 'File uploaded successfully', material: newMaterial });
    } else if (req.body.link) {
      console.log('Processing link upload...');
      // Link upload
      const newMaterial = {
        id: materials.length + 1,
        title: req.body.link,
        type: 'LINK',
        dateAdded: new Date().toISOString().split('T')[0],
        size: '-',
        url: req.body.link
      };
      materials.push(newMaterial);
      console.log('Link submitted successfully:', newMaterial);
      res.status(201).json({ message: 'Link submitted successfully', material: newMaterial });
    } else {
      console.log('No file or link provided in upload request');
      res.status(400).json({ message: 'No file or link provided' });
    }
  } catch (err) {
    console.error('Upload error:', err);
    if (err instanceof multer.MulterError) {
      console.error('Multer error code:', err.code);
      console.error('Multer error field:', err.field);
    }
    console.error(err.stack);
    res.status(500).json({ message: 'Upload error', error: err.message });
  }
});

// On server start, load existing files from uploads folder to populate materials array
const loadMaterialsFromUploads = () => {
  if (!fs.existsSync(uploadDir)) {
    console.log('Uploads folder does not exist');
    return;
  }
  const files = fs.readdirSync(uploadDir);
  files.forEach((file, index) => {
    const filePath = path.join(uploadDir, file);
    const stats = fs.statSync(filePath);
    const ext = path.extname(file).substring(1).toUpperCase();
    const material = {
      id: index + 1,
      title: file,
      type: ext || 'FILE',
      dateAdded: stats.birthtime.toISOString().split('T')[0],
      size: (stats.size / (1024 * 1024)).toFixed(2) + ' MB',
      url: `/uploads/${file}`
    };
    materials.push(material);
  });
  console.log(`Loaded ${materials.length} materials from uploads folder`);
};

loadMaterialsFromUploads();

// Route to get a material by id
app.get('/materials/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const material = materials.find(m => m.id === id);
  if (!material) {
    return res.status(404).json({ message: 'Material not found' });
  }
  res.json(material);
});

// Required for text extraction
const pdfParse = require('pdf-parse');
const mammoth = require('mammoth');

// Route to get all materials
app.get('/materials', (req, res) => {
  res.json(materials);
});

// Route to get extracted text content of a material by id
app.get('/materials/:id/content', async (req, res) => {
  const id = parseInt(req.params.id);
  const material = materials.find(m => m.id === id);
  if (!material) {
    return res.status(404).json({ message: 'Material not found' });
  }
  const filePath = path.join(uploadDir, path.basename(material.url));
  try {
    if (material.type === 'PDF') {
      const dataBuffer = fs.readFileSync(filePath);
      const data = await pdfParse(dataBuffer);
      res.json({ text: data.text });
    } else if (material.type === 'DOCX') {
      const data = await mammoth.extractRawText({ path: filePath });
      res.json({ text: data.value });
    } else if (material.type === 'TXT' || material.type === 'MD' || material.type === 'JSON') {
      const text = fs.readFileSync(filePath, 'utf-8');
      res.json({ text });
    } else {
      res.status(400).json({ message: 'Unsupported file type for text extraction' });
    }
  } catch (err) {
    console.error('Error extracting text content:', err);
    res.status(500).json({ message: 'Error extracting text content', error: err.message });
  }
});

// Serve frontend static files
const staticPath = path.join(__dirname, '../studyflow/public');
console.log('Serving static files from:', staticPath);

// Redirect root URL to index_with_music.html for instant dashboard access
app.get('/', (req, res) => {
  res.redirect('/index_with_music.html');
});

app.use(express.static(staticPath));

// Explicit route to serve index_with_music.html for testing
app.get('/index_with_music.html', (req, res) => {
  res.sendFile(path.join(staticPath, 'index_with_music.html'));
});

// Serve uploads folder statically
app.use('/uploads', express.static(uploadDir));

// DELETE route to delete a material by id
app.delete('/materials/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const index = materials.findIndex(m => m.id === id);
  if (index === -1) {
    return res.status(404).json({ message: 'Material not found' });
  }
  const material = materials[index];
  // If material is a file, delete it from uploads folder
  if (material.type !== 'LINK') {
    const filePath = path.join(__dirname, 'uploads', path.basename(material.url));
    // Check if file exists before deleting
    fs.access(filePath, fs.constants.F_OK, (accessErr) => {
      if (accessErr) {
        console.error('File does not exist:', accessErr);
        // Remove material from array anyway since file is missing
        materials.splice(index, 1);
        return res.status(200).json({ message: 'Material deleted successfully (file missing)' });
      }
      fs.unlink(filePath, (err) => {
        if (err) {
          console.error('Error deleting file:', err);
          return res.status(500).json({ message: 'Failed to delete material file', error: err.message });
        }
        // Remove material from array after file deletion
        materials.splice(index, 1);
        res.json({ message: 'Material deleted successfully' });
      });
    });
  } else {
    // For links, just remove from array
    materials.splice(index, 1);
    res.json({ message: 'Material deleted successfully' });
  }
});

// Catch-all 404 handler for unknown API routes
app.use((req, res, next) => {
  // Skip requests for static files (with extensions)
  if (/\.[^\/]+$/.test(req.path)) {
    return next();
  }
  if (req.path.startsWith('/upload') || req.path.startsWith('/materials') || req.path.startsWith('/signin') || req.path.startsWith('/login') || req.path.startsWith('/progress')) {
    return res.status(404).json({ message: 'API route not found' });
  }
  next();
});

// Error handling middleware for multer and other errors
app.use((err, req, res, next) => {
  console.error('Error middleware caught:', err);
  if (err instanceof multer.MulterError) {
    // Multer-specific errors
    return res.status(400).json({ message: 'Multer error', error: err.message });
  }
  res.status(500).json({ message: 'Server error', error: err.message });
});

// Start server
app.listen(5000, () => {
  console.log('Server is running on port 5000');
});
