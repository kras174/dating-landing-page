## Installation

1. Clone the repository:
```bash
git clone <your-repo-url>
cd dating-landing-page
```

2. Install dependencies:
```bash
npm install
```

## Development

### Start Development Server
```bash
npm run dev
```
This command will:
- Build the project
- Start a local server at `http://localhost:3000`
- Watch for file changes and automatically reload the browser
- Compile SCSS to CSS
- Minify and optimize assets

### Build for Production
```bash
npm run build
```
This command will:
- Clean the dist folder
- Compile and minify SCSS
- Minify JavaScript
- Optimize images
- Generate source maps
- Create production-ready files in the `dist/` folder

