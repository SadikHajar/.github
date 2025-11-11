# LinkedIn Job Application Bot 🤖

An AI-powered application that automatically applies to LinkedIn jobs using your CV. Upload your resume, configure your preferences, and let the bot handle the rest!

## Features

- 📄 **CV Upload & AI Parsing** - Upload PDF/DOCX and AI extracts your information
- 🎯 **Smart Job Matching** - Configure preferences (title, location, experience level)
- 🤖 **Automated Applications** - Bot applies to "Easy Apply" jobs automatically
- 📊 **Real-time Dashboard** - Track applications, success rate, and errors
- 🔒 **Secure** - Credentials encrypted and stored locally
- ✍️ **AI Cover Letters** - Generates custom cover letters for each job

## Prerequisites

- Node.js 14+ installed
- OpenAI API key ([Get one here](https://platform.openai.com/api-keys))
- LinkedIn account (without 2FA enabled)

## Installation

### 1. Clone and Install Dependencies

```bash
cd linkedin-job-bot

# Install frontend dependencies
npm install

# Install backend dependencies
cd server
npm install
cd ..
```

### 2. Configure Environment Variables

Create a `.env` file in the `server` directory:

```bash
cd server
cp .env.example .env
```

Edit `server/.env` and add your OpenAI API key:

```env
OPENAI_API_KEY=sk-your-openai-api-key-here
PORT=5000
ENCRYPTION_KEY=your-32-character-encryption-key-here
```

**Important:** Generate a secure 32-character encryption key for password encryption:
```bash
node -e "console.log(require('crypto').randomBytes(16).toString('hex'))"
```

## Usage

### 1. Start the Backend Server

```bash
cd server
npm start
```

The server will run on `http://localhost:5000`

### 2. Start the Frontend (in a new terminal)

```bash
cd linkedin-job-bot
npm start
```

The app will open at `http://localhost:3000`

### 3. Use the Application

1. **Upload CV**: Drag and drop your CV (PDF or DOCX)
2. **Configure**: Set job preferences and LinkedIn credentials
3. **Start Applying**: Click the button and watch the bot work!

## How It Works

1. **CV Parsing**: AI extracts your name, email, phone, skills, experience, and education
2. **Job Search**: Bot logs into LinkedIn and searches for jobs matching your criteria
3. **Smart Application**: For each "Easy Apply" job:
   - Generates a custom cover letter using AI
   - Auto-fills application forms with your CV data
   - Submits the application
4. **Tracking**: All applications are logged with status (applied/failed)

## Important Notes

⚠️ **LinkedIn Account Requirements:**
- Disable 2-factor authentication (2FA) before using
- Use a strong password and change it after testing
- The bot only works with "Easy Apply" jobs

⚠️ **Rate Limiting:**
- Bot includes delays to avoid detection
- Recommended: Apply to max 10-20 jobs per session
- Wait a few hours between sessions

⚠️ **Legal & Ethical:**
- Use responsibly and in accordance with LinkedIn's Terms of Service
- This tool is for educational purposes
- Always review applications before submission in production use

## Troubleshooting

### "LinkedIn security challenge detected"
- LinkedIn may require manual verification
- Log into LinkedIn manually first in the same browser
- Try again after completing any security checks

### "Failed to parse CV"
- Ensure your CV is in PDF or DOCX format
- Check that your OpenAI API key is valid
- Verify the CV has clear sections (name, email, experience, etc.)

### "Easy Apply not available"
- Not all jobs support Easy Apply
- Bot will skip these and move to the next job
- Check the error log in the dashboard

### Applications failing
- Check your LinkedIn credentials are correct
- Ensure your CV data is complete (name, email, phone)
- Some jobs require additional information the bot can't provide

## Project Structure

```
linkedin-job-bot/
├── src/                    # React frontend
│   ├── components/         # UI components
│   │   ├── UploadCV.js
│   │   ├── Configure.js
│   │   ├── Dashboard.js
│   │   └── ApplicationStatus.js
│   ├── App.js
│   └── index.js
├── server/                 # Express backend
│   ├── services/
│   │   ├── cvParser.js     # PDF/DOCX parsing
│   │   ├── aiService.js    # OpenAI integration
│   │   ├── linkedinBot.js  # Puppeteer automation
│   │   └── storage.js      # Data persistence
│   ├── data/               # Stored data (CV, config, applications)
│   ├── uploads/            # Temporary CV uploads
│   └── index.js            # Express server
└── README.md
```

## API Endpoints

- `POST /api/upload-cv` - Upload and parse CV
- `POST /api/configure` - Save job preferences and credentials
- `POST /api/start-applications` - Start the application process
- `GET /api/applications` - Get all applications
- `GET /api/status` - Get current bot status
- `GET /api/cv` - Get parsed CV data
- `GET /api/config` - Get saved configuration

## Technologies Used

- **Frontend**: React, Tailwind CSS, Axios
- **Backend**: Node.js, Express, Multer
- **AI**: OpenAI GPT-3.5
- **Automation**: Puppeteer
- **File Processing**: pdf-parse, mammoth
- **Security**: crypto-js for encryption

## Future Enhancements

- [ ] Support for more job platforms (Indeed, Glassdoor)
- [ ] Browser extension for easier use
- [ ] Advanced filtering (salary, company size)
- [ ] Email notifications for applications
- [ ] Application analytics and insights
- [ ] Resume optimization suggestions

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT License - feel free to use this project for personal or educational purposes.

## Disclaimer

This tool is provided as-is for educational purposes. Use at your own risk. The authors are not responsible for any consequences of using this tool, including but not limited to LinkedIn account restrictions or violations of terms of service.

## Support

If you encounter issues or have questions:
1. Check the Troubleshooting section above
2. Review the console logs for detailed error messages
3. Ensure all prerequisites are met
4. Verify your OpenAI API key has sufficient credits

---

**Happy Job Hunting! 🚀**
