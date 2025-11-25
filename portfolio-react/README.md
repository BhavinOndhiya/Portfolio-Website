# Portfolio Website - React Version

This is a React migration of the original HTML/CSS/JS portfolio website. All features from the original site have been preserved and converted to React components.

## Features

- ✅ Single Page Application with smooth scrolling
- ✅ Responsive navigation sidebar
- ✅ Theme color switcher (5 color themes)
- ✅ Dark/Light mode toggle
- ✅ Typing animation for profession
- ✅ Skills progress bars
- ✅ Timeline for Education, Projects, and Experience
- ✅ Portfolio showcase
- ✅ Contact form with FormSubmit integration
- ✅ Fully responsive design

## Installation

1. Navigate to the project directory:
```bash
cd portfolio-react
```

2. Install dependencies:
```bash
npm install
```

## Running the Application

Start the development server:
```bash
npm start
```

The app will open at `http://localhost:3000`

## Building for Production

To create a production build:
```bash
npm run build
```

## Utilities

### Reprocess legacy portfolio images

If you imported projects before the admin image pipeline existed, you can normalize
those files without manually re-uploading them:

1. Ensure `.env` includes `MONGODB_URI`, `AWS_*` credentials, and `AWS_PUBLIC_BASE_URL`.
2. Run the script (dry-run first for safety):
   ```bash
   npm run reprocess:portfolio -- --dry-run
   npm run reprocess:portfolio
   ```
3. Use `--force` to reprocess entries already marked as standardized.

The script downloads each portfolio image, resizes/crops it to 1200×900 using Sharp,
uploads the new asset to your S3 bucket, and updates the stored content document.

## Project Structure

```
portfolio-react/
├── public/
│   └── BhavinOndhiya-july-2025.pdf  # CV file
├── src/
│   ├── assets/                      # Images
│   │   ├── bhavin.JPG
│   │   ├── DataGrafico.png
│   │   ├── codeinsights.JPG
│   │   └── Screenshot 2024-02-25 150804.png
│   ├── components/                  # React components
│   │   ├── Home.js
│   │   ├── About.js
│   │   ├── Services.js
│   │   ├── Portfolio.js
│   │   ├── Contact.js
│   │   ├── Sidebar.js
│   │   └── StyleSwitcher.js
│   ├── context/                     # React Context
│   │   └── ThemeContext.js
│   ├── App.js                       # Main App component
│   ├── index.js                     # Entry point
│   ├── index.css                    # Main styles
│   └── styleswitcher.css            # Style switcher styles
```

## Key Technologies

- React 18
- React Icons
- Typed.js (for typing animation)
- CSS Variables (for theming)
- FormSubmit (for contact form)

## Notes

- All images should be placed in `src/assets/`
- PDF files should be placed in `public/`
- Theme colors can be customized in `ThemeContext.js`
- The contact form uses FormSubmit service

## Original Features Preserved

All features from the original HTML version have been maintained:
- Same layout and design
- Same color themes
- Same animations
- Same functionality
- Same responsive behavior
