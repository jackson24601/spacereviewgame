# Space Review Game

A web-based review game for classroom learning with teacher and student components.

## Features

### Teacher Portal
- Upload CSV files containing terms and definitions
- Preview uploaded content
- Beautiful, modern UI with drag-and-drop support

### Coming Soon
- Student-facing quiz interface
- Multiple choice question generation
- Real-time classroom gameplay

## Getting Started

### Prerequisites
- Node.js 18+ installed

### Installation

```bash
npm install
```

### Development

Run both the frontend and backend servers:

```bash
npm run dev:all
```

Or run them separately:

```bash
# Frontend (Vite dev server on port 3000)
npm run dev

# Backend (Express server on port 3001)
npm run server
```

Visit `http://localhost:3000` to access the teacher portal.

### CSV Format

Your CSV file should have the following format:

```csv
Term,Definition
Photosynthesis,The process by which plants convert light energy into chemical energy
Mitosis,Cell division that results in two identical daughter cells
DNA,Deoxyribonucleic acid - the molecule that carries genetic information
```

**Requirements:**
- First column: Term
- Second column: Definition
- Include a header row
- UTF-8 encoding recommended

## Technology Stack

- **Frontend**: React 18, Vite, Tailwind CSS
- **Backend**: Express.js, Multer, PapaParse
- **Build Tool**: Vite

## Project Structure

```
spacereviewgame/
├── src/
│   ├── components/
│   │   └── TeacherUpload.jsx
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css
├── server/
│   └── index.js
├── index.html
├── package.json
└── vite.config.js
```

## License

MIT
