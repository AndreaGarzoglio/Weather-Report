# Reusable Webpack Template

A ready-to-use webpack template for starting new JavaScript projects with modern tooling.

## Features

- Webpack 5 with development server
- HTML Webpack Plugin for automatic HTML generation
- CSS and style loaders
- ES modules support
- Pre-configured with modern CSS (inspired by To Do List project)

## Getting Started

1. Copy this folder to create a new project
2. Run `npm install` to install dependencies
3. Run `npm run dev` to start the development server
4. Run `npm run build` to create a production build

## Project Structure

```
src/
├── index.html      # HTML template
├── index.js        # JavaScript entry point
└── styles.css      # Stylesheet with CSS variables and base styles
```

## Scripts

- `npm run dev` - Start webpack dev server with hot reload
- `npm run build` - Build for production

## Customization

Edit the files in the `src/` folder to customize your project:

- Modify `index.html` for your HTML structure
- Add your JavaScript logic to `index.js`
- Update `styles.css` with your custom styles
