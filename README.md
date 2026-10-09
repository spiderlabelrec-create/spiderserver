# Music Label Dashboard

A simple web dashboard for a music record label with login authentication.

## Features
- User login with session management
- Dashboard displaying statistics and recent activity
- Responsive design
- Client-side form handling with AJAX

## Installation
1. Make sure you have Node.js installed (v14+ recommended).
2. Clone or download this repository.
3. Navigate to the project directory and install dependencies:
   ```
   npm install
   ```

## Usage
1. Start the server:
   ```
   npm start
   ```
   Or for development with auto-reload:
   ```
   npm run dev
   ```
2. Open your browser and go to `http://localhost:3000`
3. Login with the default credentials:
   - Username: `admin`
   - Password: `password`

## Project Structure
- `server.js` - Main Express server with session handling
- `public/` - Static files (HTML, CSS, JavaScript)
  - `login.html` - Login page
  - `dashboard.html` - Dashboard page
  - `style.css` - Stylesheet
  - `script.js` - Client-side JavaScript
- `package.json` - Project dependencies and scripts

## Security Note
This is a demonstration project. In a production environment, you should:
- Use a strong secret key for sessions
- Store user credentials securely (hashed passwords in a database)
- Use HTTPS in production
- Implement proper input validation and sanitization
- Add more robust error handling

## Customization
- To add more users, edit the `users` array in `server.js`
- To change the dashboard statistics, modify `dashboard.html` and update the values
- To change the styling, edit `public/style.css`