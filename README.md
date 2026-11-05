# GreenNest

GreenNest is a food-management web app for keeping track of food inventory, expiry dates, and food waste. It includes a React frontend and an Express API backed by MongoDB.

## What you can do

- Create an account and sign in with email/password; Google sign-in is also available.
- Add and manage food inventory, including expiry dates.
- Analyze a food photo with Gemini AI for an estimated freshness and shelf life.
- Track wasted food and view waste statistics.
- Create food pickup requests for farmers or NGOs.
- Exchange messages in real time and manage a farmer profile.
- Export food and waste reports as PDF or Excel files.

## Technologies

- **Frontend:** React 18, React Router, Axios
- **Backend:** Node.js (ES modules), Express, Socket.IO
- **Database:** MongoDB with Mongoose
- **Other integrations:** Google OAuth, Gemini AI, Nodemailer

## Requirements

- Node.js 18 or later and npm
- MongoDB, running locally or available through MongoDB Atlas
- A Gemini API key to use food-photo analysis
- Optional: Google OAuth credentials for Google sign-in, and Gmail app-password credentials for password-reset email

## Run locally

Open a terminal in the `Project_GreenNest` directory.

1. Install the backend dependencies:

   ```bash
   npm install
   ```

2. Install the frontend dependencies:

   ```bash
   cd client
   npm install
   cd ..
   ```

3. Create a `.env` file in the project root:

   ```env
   PORT=5000
   MONGO_URI=mongodb://localhost:27017/foodShelfLife
   JWT_SECRET=replace_with_a_long_random_secret
   SESSION_SECRET=replace_with_another_long_random_secret
   GEMINI_API_KEY=your_gemini_api_key
   GEMINI_MODEL=gemini-3.5-flash-lite

   # Optional: Google sign-in
   GOOGLE_CLIENT_ID=your_google_oauth_client_id

   # Optional: password-reset email
   EMAIL_USER=your_gmail_address
   EMAIL_PASSWORD=your_gmail_app_password
   ```

   The server defaults to the local MongoDB URL above and port `5000` if `MONGO_URI` or `PORT` is omitted. Set your own secrets; do not use example values in a deployed environment.

4. Start the frontend and backend from the project root:

   ```bash
   npm run dev
   ```

   Open the app at [http://localhost:3000](http://localhost:3000). The API runs at [http://localhost:5000](http://localhost:5000).

## Deploy on Render

Deploy the backend and React app together as one Render **Web Service**:

1. Use the repository root as the service's root directory.
2. Set the build command to `npm ci && npm --prefix client ci && npm --prefix client run build`.
3. Set the start command to `npm start`.
4. Set the backend environment variables in Render: `MONGO_URI`, `JWT_SECRET`, `SESSION_SECRET`, `GEMINI_API_KEY`, and `GEMINI_MODEL=gemini-3.5-flash-lite`. Add `GOOGLE_CLIENT_ID` if Google sign-in is enabled.

Express serves the compiled React app from `client/build`, including direct navigation and refreshes on frontend routes. The frontend uses the same service origin for API requests in production. `CLIENT_ORIGIN` can be set to the service URL if cross-origin requests are needed.

Use a hosted MongoDB connection string for `MONGO_URI`. Do not commit `.env` files or put server secrets in the frontend environment.

## Useful commands

Run these from the project root unless noted:

| Command | Purpose |
|---|---|
| `npm run dev` | Start the backend with nodemon and the React frontend |
| `npm start` | Start only the backend |
| `npm run server` | Start only the backend with nodemon |
| `npm run client` | Start only the frontend |
| `cd client && npm run build` | Create a production frontend build in `client/build` |
| `cd client && npm test` | Run the frontend test runner |

## API overview

The backend listens on port `5000`. Protected endpoints expect a bearer token in the `Authorization` header.

| Endpoint | Description |
|---|---|
| `POST /auth/register` | Register a user or farmer |
| `POST /auth/login` | Sign in with email and password |
| `POST /auth/google` | Sign in with a Google ID token |
| `GET /auth/me` | Get the signed-in user's profile |
| `POST /ai/analyze` | Analyze an uploaded image (`multipart/form-data`, field name `image`) |
| `POST /ai/farming-ideas` | Request reuse ideas for donated food |
| `/food` | Manage the signed-in user's food inventory |
| `/wastage` | Access waste tracking and statistics |
| `POST /reports/export` | Export a report as PDF or Excel |
| `POST /donations/requests` | Create a food pickup request |
| `/notifications` | View and manage notifications |

## Project layout

```text
Project_GreenNest/
├── app.js                 # Express and Socket.IO server
├── routes/                # API route handlers
├── models/                # MongoDB/Mongoose models
├── middleware/            # Authentication middleware
├── utils/                 # Shared backend utilities, including Gemini analysis
└── client/
    ├── src/               # React app, pages, and components
    └── public/            # Static frontend files
```

## Notes

- The frontend development server proxies API requests to `http://localhost:5000`.
- Food-photo analysis requires `GEMINI_API_KEY`; `GEMINI_MODEL` is optional and defaults to `gemini-3.5-flash-lite`.
- Gemini requests retry `429`, `500`, and `503` responses up to four times with exponential backoff and jitter, then try `gemini-3.5-flash-lite` and `gemini-3.8-flash` in order.
- Keep `.env` and all API credentials private. Do not commit secrets to source control.
