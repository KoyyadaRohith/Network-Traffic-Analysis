# CyberFlow Intelligence — Frontend Application

This directory contains the single-page application (SPA) client for **CyberFlow Intelligence**, built with React 18, Vite, Recharts, and Vanilla CSS.

For the comprehensive end-to-end documentation including architecture diagrams, Star Schema specifications, OLAP operations, and Random Forest evaluation metrics, please refer to the primary root documentation:

👉 **[Primary Project Documentation & Architecture (Root README.md)](../README.md)**

---

## 🎨 Design System & Theme
The frontend uses a custom **Bright Analytical Design System** defined in [`src/index.css`](src/index.css):
- **Base Canvas**: Light off-white `#F4F8FB`
- **Surface Tiles**: Crisp white `#FFFFFF` with subtle borders (`#C9D9E2`)
- **Primary Accent**: Analytical Cyan `#007F9B`
- **Semantic Accents**:
  - Normal Traffic: `#15803D` / `#22C55E`
  - Suspicious Traffic: `#C62828` / `#EF4444`
  - Warehouse Dimension: `#7C3AED` / `#A855F7`
  - OLAP Operations: `#C47A00` / `#F59E0B`
- **Typography**: Inter (UI body) & JetBrains Mono (numerical / technical metrics)

---

## 🚀 Running Locally

### 1. Install Dependencies
```bash
npm install
```

### 2. Run Development Server
```bash
npm run dev
```
The application will launch on `http://localhost:5173`. Make sure the FastAPI backend is running simultaneously on `http://127.0.0.1:8000`.

### 3. Build for Production
```bash
npm run build
```
Production assets are generated in `dist/`.
