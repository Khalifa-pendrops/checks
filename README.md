# TruthCheck - Fact-checking API with Nigeria in focus

![TruthCheck Logo](https://via.placeholder.com/150x50?text=TruthCheck)  
A fact-checking platform, focused on Nigerian claims in politics, health, and security.

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
- *Multi-format claims*: Text, URLs, and images
- *Nigerian context detection*: Auto-detects Nigeria-related claims
- *Composite verdicts*: Combines results from multiple sources

### Specialized Services
- *Twitter Monitoring*: Real-time tracking of trending Nigerian claims
- *Africa Check Integration*: Verified Nigerian fact-checks
- *Local Scrapers*: FactCheckHub and Dubawa integration

### User Management
- Role-based access (Users, Admins)
- Language preferences (English, Yoruba, Igbo, Hausa, Pidgin)
- Claim history and tracking

---

## 💻 Tech Stack

### Backend
- *Runtime*: Node.js 16+
- *Framework*: Express.js
- *Database*: MongoDB (with Mongoose)
- *APIs*: 
  - Google Fact Check Tools
  - Twitter API v2
  - Africa Check API
- *Scraping*: Cheerio + Puppeteer

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
    ```
    # Core
    PORT=5000
    DATABASE_URL=mongodb://localhost:27017/truthcheck
    JWT_SECRET=your_jwt_secret
    JWT_EXPIRES_IN=30d

    # Google FactCheck
    GOOGLE_FACTCHECK_API_KEY=your_key
    GOOGLE_FACTCHECK_API_URL=https://factchecktools.googleapis.com/v1alpha1

    # Twitter
    TWITTER_API_KEY=your_key
    TWITTER_API_SECRET=your_secret
    TWITTER_ACCESS_TOKEN=your_token
    TWITTER_ACCESS_SECRET=your_secret

    # Africa Check
    AFRICACHECK_API_KEY=your_key
    AFRICACHECK_ENDPOINT=https://africacheck.org/api/v1

    # Redis
    REDIS_URL=redis://localhost:6379

    # Scraping
    SCRAPING_USER_AGENT="TruthCheckBot/1.0 (+https://yourdomain.com)"
    SCRAPING_TIMEOUT=10000

    ```

---

## API Endpoints 

### Claims

### Trends

### Admin

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


