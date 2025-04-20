# TruthCheck - Fact-checking API with Nigeria in focus

A fact-checking platform, intended to be focused on Nigerian claims in politics, health, and security. At the moment, `claimType` is _text_, other `claimTypes` (_url_, _images_) could be implemented. Alos at the moment, fact-checking is via Google Fact Check Tools API, others such as African Check API and local scrapping can as well be implemented. Base URL: [https://checks-7xnf.onrender.com]

---

## 📌 Table of Contents

- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Installation](#-installation)
- [Configuration](#-configuration)
- [API Endpoints](#-api-endpoints)
- [Services Integration](#-services-integration)
- [Contributing](#-contributing)

---

## 🌟 Features

### Core Verification

- _Multi-format claims_: Text, URLs, and images
- _Nigerian context detection_: Auto-detects Nigeria-related claims
- _Composite verdicts_: Combines results from multiple sources

### Specialized Services (yet to be implemented)

- _Twitter Monitoring_: Real-time tracking of trending Nigerian claims
- _Africa Check Integration_: Verified Nigerian fact-checks
- _Local Scrapers_: FactCheckHub and Dubawa integration

### User Management

- Role-based access (Users, Admins)
- Language preferences (English, Yoruba, Igbo, Hausa)
- Claim history and tracking

---

## 💻 Tech Stack

### Backend

- _Runtime_: Node.js 16+
- _Framework_: Express.js
- _Database_: MongoDB (with Mongoose)
- _APIs_:
  - Google Fact Check Tools
  - Twitter API v2
  - Africa Check API
- _Scraping_: Cheerio + Puppeteer

### Frontend (Optional)

- React.js and/or Next.js
- Chakra UI
- Bootstrap
- i18n for multilingual support

### Infrastructure

- Redis for caching/rate-limiting
- Docker for containerization
- Render for backend deployment

---

## 🛠 Installation

### Prerequisites

- Node.js 16+
- Express 4.18.2+
- MongoDB 4.4+
- Redis 6+
- Twitter Developer Account

---

### Steps

1. Clone the repository:

   ```bash
   git clone https://github.com/Khalifa-pendrops/checks.git
   cd truthcheck

   ```

2. Install dependencies

   ```
   npm install

   ```

3. Configure environment variables

   ```
   cp .env.example .env
   Edit .env with your test keys

   ```

4. Run the dev server

   ```
   npm run dev

   ```

---

## 🔌 Configuration

Create a .env in the root directory:
 ### Core
 ```
PORT=5000
DATABASE_URL=mongodb://localhost:27017/truthcheck
JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=30d

```

### Google FactCheck
```
GOOGLE_FACTCHECK_API_KEY=your_key
GOOGLE_FACTCHECK_API_URL=https://factchecktools.googleapis.com/v1alpha1

```

### Twitter
```
TWITTER_API_KEY=your_key
TWITTER_API_SECRET=your_secret
TWITTER_ACCESS_TOKEN=your_token
TWITTER_ACCESS_SECRET=your_secret

```

### Africa Check
```
AFRICACHECK_API_KEY=your_key
AFRICACHECK_ENDPOINT=https://africacheck.org/api/v1

```

### Redis
```
REDIS_URL=redis://localhost:6379

```

### Scraping
```
SCRAPING_USER_AGENT="TruthCheckBot/1.0 (+https://yourdomain.com)"
SCRAPING_TIMEOUT=10000

```

---

## 📐 API Endpoints

### Auth Endpoints

Role is optionally attached to the JWT token during auth. While `role` is an optional property, the auth middleware requires he `role` property to be defined in the request payload _FOR ADMIN SIGNUP AND LOGIN_.

1. Signup

```
POST: /api/v1/users/signup

Example:
{
  "name": "John Doe",
  "email": "user@example.com",
  "password": "password123",
  "passwordConfirm": "password123"
  "role": "admin" //required only for admin signup
}

```

2. Login

```
POST: /api/v1/users/login

Example:
{
  "email": "user@example.com",
  "password": "password123"
}

```

### Claim Endpoints

1. POST: new text claim (private - logged in user)

```
/api/v1/claims/

Example:

{
  "claimType": "text",
  "content": "Sample claim text",
  "language": "en"
}

```

2. GET: get all claims (admin)

```
/api/v1/claims/

```

3. GET: get current user's claims (private)

```
/api/v1/claims/my-claims

```

4. GET: get claim by `ID` (private and admin)

```
/api/v1/claims/:id

```

5. PATCH: update cliam metadata (admin)

```
/api/v1/claims/:id

```

6. DELETE: delete claim (admin)

```
/api/v1/claims/:id

```

7. POST: reprocess claim (admin)

```
/api/v1/claims/"id/reprocess

```


### Language Endpoints

1. GET: list all supported languages (public)

```/api/v1/language/

```

2. GET: get Nigerian languages (public)

```
/api/v1/language/nigerian

```

3. POST: add new language (admin)

```
/api/v1/language/

Example:

{
  "code": "yo",
  "name": "Yoruba",
  "nativeName": "Èdè Yorùbá",
  "isActive": true
}

```

4. PATCH: update language (admin)

```
/api/v1/language/:code

```

---


## 🗑️ Postman Collection Structure

Truth Check API/
├── Authentication/
│   ├── Login
│   ├── Signup
├── Users/
│   ├── Get My Profile
│   ├── Update Profile
├── Claims/
│   ├── Submit Claim (Text)
│   ├── Submit Claim (URL) //not implemented yet
│   ├── Submit Claim (Image) //not implemented yet
│   ├── Get My Claims
│   ├── Get Claim by ID
├── Languages/
│   ├── List Languages
│   ├── Add Language (Admin)
└── Admin/
    ├── Get All Claims
    ├── Reprocess Claim

---

## 🔌Service Integration

### Twitter Monitoring

    ```
    // starts monitoring Nigerian trends

    twitterService.startMonitoring();

    ```

### Africa Check API

    ```
    //Search for Nigerian claims

    const results = await africacheckService.searchClaims("election", "NG");

    ```

### Local Scrappers

    ```
    //Scrape FactCheckHub

    const data = await scraperService.scrapeFactCheckHub("covid vaccine");

    ```

---

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push the the branch
5. Open Pull Request

---
