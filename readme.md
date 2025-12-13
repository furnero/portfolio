# Portfolio Website

A modern, interactive portfolio website featuring real-time Discord status integration, dynamic activity widgets, and a custom comment system.

## Features

### Core Functionality
- Responsive design with glassmorphic UI elements
- Real-time Discord status display via Lanyard API
- Dynamic Spotify and gaming activity widget
- Firebase-powered comment system with likes
- Image gallery with lightbox and spoiler support
- Custom overlay system for different content sections

### Themes
- Default dark theme with purple/blue gradients
- Winter theme with blue/white color scheme
- PawHost theme with orange color palette
- Animated background with falling paw prints

### Interactive Elements
- Easter egg system (type "owo" or "uwu", or shake on mobile)
- Custom status bubble for Discord messages
- Smooth animations and transitions
- Keyboard shortcuts (ESC to close overlays)

## Tech Stack

### Frontend
- HTML5
- CSS3 (Custom properties, animations, glassmorphism)
- Vanilla JavaScript (ES6+)
- Font Awesome icons
- Space Grotesk font family

### Backend Services
- Firebase Firestore (comment storage)
- Lanyard API (Discord status)
- Python HTTP server (local development)

## Installation

### Prerequisites
- Python 3.x (for local server)
- Modern web browser
- Firebase project (for comments feature)

### Setup

1. Clone the repository
   git clone <repository-url>
   cd portfolio

2. Configure Firebase
   - Create a Firebase project at https://console.firebase.google.com
   - Enable Firestore Database
   - Update the Firebase config in script.js with your credentials

3. Update Discord User ID
   - Replace the Discord user ID in script.js (search for 683815400835645527)
   - Get your Discord ID from Discord Developer Mode

4. Start the local server
   python3 server.py

5. Open your browser
   - Navigate to http://localhost:8050

## File Structure
```
portfolio/
├── index.html          # Main HTML structure
├── style.css           # Styles and animations
├── script.js           # JavaScript functionality
├── server.py           # Python development server
├── fonts/              # Custom fonts (Mojangles)
├── img/                # Images and SVG assets
│   ├── paw.svg
│   ├── pawhost.svg
│   └── minecraft.svg
└── sounds/             # Easter egg sound effects
    ├── owo2.mp3
    └── owo4.mp3
```
## Configuration

### Discord Status
Update the Lanyard API user ID in two places in script.js:
- fetchDiscordStatus() function
- updateActivityWidget() function

### Comments System
Configure Firebase Firestore rules for proper security.

### Themes
Toggle themes via:
- PawHost button in the interface
- Winter theme auto-enables in December

## Customization

### Colors
Edit CSS custom properties in style.css:
:root {
  --primary: #6366f1;
  --secondary: #a855f7;
  --accent: #22d3ee;
  --bg-dark: #0a0a12;
}

### Profile Information
Update in index.html:
- Profile name
- Bio text
- Avatar image
- Links and buttons

### Gallery Images
Add images to the gallery grid in index.html with data-spoiler attribute.

## Server Security

The Python server includes:
- Directory listing prevention
- Hidden file blocking
- Path traversal protection
- File extension filtering
- Security headers (X-Frame-Options, X-Content-Type-Options, etc.)

## Browser Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Opera 76+

## Development

### Running Locally
python3 server.py

### Production Build
No build step required. Deploy static files to any web server or hosting platform:
- GitHub Pages
- Netlify
- Vercel
- Traditional web hosting

## License

This project is available for personal use. Modify and customize as needed.
Do not use any of my variables, text or images as your own!

## Credits

- Font Awesome for icons
- Google Fonts for Space Grotesk
- Lanyard API for Discord integration
- Firebase for backend services
s