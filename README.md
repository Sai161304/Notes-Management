# 📝 Notes CRUD Application

A full-stack notes management application built with Node.js, MySQL, and React.js. This application allows you to create, read, update, and delete notes with a beautiful, modern user interface.

## 🚀 Features

- **Create Notes**: Add new notes with title and content
- **Read Notes**: View all your notes in a responsive grid layout
- **Update Notes**: Edit existing notes with a modal form
- **Delete Notes**: Remove notes with confirmation
- **Responsive Design**: Works perfectly on desktop, tablet, and mobile
- **Modern UI**: Beautiful gradient design with smooth animations
- **Real-time Updates**: Changes are reflected immediately in the interface

## 🛠️ Tech Stack

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web framework
- **MySQL** - Database
- **mysql2** - MySQL client for Node.js
- **CORS** - Cross-origin resource sharing
- **dotenv** - Environment variables

### Frontend
- **React.js** - Frontend framework
- **CSS3** - Styling with modern features
- **Fetch API** - HTTP requests

## 📋 Prerequisites

Before running this application, make sure you have the following installed:

- **Node.js** (v14 or higher)
- **MySQL** (v8.0 or higher)
- **npm** or **yarn**

## 🔧 Installation & Setup

### 1. Clone the Repository
```bash
git clone <your-repo-url>
cd notes-crud-app
```

### 2. Install Backend Dependencies
```bash
npm install
```

### 3. Install Frontend Dependencies
```bash
cd client
npm install
cd ..
```

### 4. Database Setup

#### Create MySQL Database
```sql
CREATE DATABASE notes_db;
```

#### Configure Environment Variables
Create a `.env` file in the root directory:
```env
# Database Configuration
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password_here
DB_NAME=notes_db

# Server Configuration
PORT=5000
```

Replace `your_password_here` with your actual MySQL password.

### 5. Start the Application

#### Option 1: Start Backend and Frontend Separately

**Terminal 1 - Backend:**
```bash
npm run dev
```

**Terminal 2 - Frontend:**
```bash
npm run client
```

#### Option 2: Start Both Together
```bash
npm run dev:full
```

## 🌐 Usage

1. **Access the Application**: Open your browser and go to `http://localhost:3000`

2. **Create a Note**: Click the "Add New Note" button to create your first note

3. **View Notes**: All your notes will be displayed in a responsive grid

4. **Edit a Note**: Click the edit button (✏️) on any note to modify it

5. **Delete a Note**: Click the delete button (🗑️) to remove a note (with confirmation)

## 📁 Project Structure

```
notes-crud-app/
├── client/                 # React frontend
│   ├── public/
│   ├── src/
│   │   ├── components/     # React components
│   │   │   ├── NoteList.js
│   │   │   ├── NoteForm.js
│   │   │   └── NoteModal.js
│   │   ├── App.js         # Main App component
│   │   ├── App.css        # Styles
│   │   └── index.js
│   └── package.json
├── server.js              # Express server
├── package.json           # Backend dependencies
├── env.example           # Environment variables template
└── README.md
```

## 🔌 API Endpoints

The backend provides the following REST API endpoints:

- `GET /api/notes` - Get all notes
- `GET /api/notes/:id` - Get a specific note
- `POST /api/notes` - Create a new note
- `PUT /api/notes/:id` - Update a note
- `DELETE /api/notes/:id` - Delete a note
- `GET /api/health` - Health check

### Example API Usage

**Create a note:**
```bash
curl -X POST http://localhost:5000/api/notes \
  -H "Content-Type: application/json" \
  -d '{"title": "My Note", "content": "This is my note content"}'
```

**Get all notes:**
```bash
curl http://localhost:5000/api/notes
```

## 🎨 Features in Detail

### Frontend Features
- **Responsive Grid Layout**: Notes are displayed in a responsive grid that adapts to different screen sizes
- **Modal Forms**: Create and edit notes using beautiful modal dialogs
- **Real-time Updates**: Changes are immediately reflected in the UI
- **Error Handling**: User-friendly error messages
- **Loading States**: Visual feedback during API calls
- **Confirmation Dialogs**: Safe deletion with user confirmation

### Backend Features
- **RESTful API**: Clean and consistent API design
- **Input Validation**: Server-side validation for data integrity
- **Error Handling**: Comprehensive error handling and responses
- **Database Connection**: Automatic table creation and connection management
- **CORS Support**: Cross-origin requests enabled for frontend integration

## 🚀 Deployment

### Backend Deployment
1. Set up a MySQL database on your hosting provider
2. Update environment variables with production database credentials
3. Deploy to platforms like Heroku, DigitalOcean, or AWS

### Frontend Deployment
1. Build the React app: `cd client && npm run build`
2. Deploy the `build` folder to platforms like Netlify, Vercel, or GitHub Pages
3. Update the API base URL in `App.js` to point to your production backend

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Commit your changes: `git commit -am 'Add some feature'`
4. Push to the branch: `git push origin feature-name`
5. Submit a pull request

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🐛 Troubleshooting

### Common Issues

1. **Database Connection Error**
   - Ensure MySQL is running
   - Check your database credentials in `.env`
   - Verify the database exists

2. **Port Already in Use**
   - Change the PORT in `.env` file
   - Kill the process using the port: `lsof -ti:5000 | xargs kill -9`

3. **CORS Issues**
   - Ensure the backend is running on port 5000
   - Check that CORS is properly configured in `server.js`

4. **Frontend Not Loading**
   - Make sure both backend and frontend are running
   - Check browser console for errors
   - Verify the API base URL in `App.js`

## 📞 Support

If you encounter any issues or have questions, please:
1. Check the troubleshooting section above
2. Search existing issues in the repository
3. Create a new issue with detailed information about your problem

---

**Happy Note Taking! 📝✨**

