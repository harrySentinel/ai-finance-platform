# 💸 Finsight Ai - AI-Powered Financial Management Platform

Finsight AI is an AI-driven financial management platform designed to help users **track, analyze, and optimize their spending** through a secure, modern, and seamless experience.

---

## 🚀 Features

- 📊 **Real-Time Dashboard** with Pie Charts & Transaction Logs
- 💰 **Set Monthly Budgets** and monitor expenses across multiple accounts (Savings, Current)
- 🧾 **AI Receipt Scanner** (powered by Gemini 1.5 Flash) to auto-fill transaction data from scanned receipts
- 🧠 **AI-Powered Insights** and real-time feedback on budgeting performance
- 📧 **Real-Time Email Alerts** when user crosses 90% of their budget
- 📈 **Monthly Email Reports** with summaries, tips, and expense breakdowns
- 🔐 **Top-tier Security** integration using Arcjet
- 🧩 **Category-Based Transaction Management**
- 👥 **Multi-Account Handling**
- 📥 **Supabase Integration** with secure auth and real-time database updates

---

## 🧠 Tech Stack

- **Frontend**: Next.js 15, React 19, TailwindCSS, Shadcn/UI
- **Backend**: Supabase, Prisma ORM, PostgreSQL
- **AI Integration**: Gemini 1.5 Flash for smart receipt scanning
- **Security**: Arcjet for advanced edge-level protection
- **Background Jobs**: Inngest for real-time email alerts and monthly reports
- **Data Visualization**: React Recharts for interactive dashboards
- **Deployment**: Vercel

---

<!-- ## 📸 Screenshots

> Providing Soon !!
 -->


## 📬 Environment Variables

To run this project locally, create a `.env` file and add the following environment variables:

| Key                | Description                               |
|--------------------|-------------------------------------------|
| `SUPABASE_URL`     | Supabase project URL                      |
| `SUPABASE_KEY`     | Supabase public anon key                  |
| `ARCJET_API_KEY`   | Arcjet API key for security               |
| `INNGEST_API_KEY`  | Inngest API key for background jobs       |
| `GEMINI_API_KEY`   | Gemini/GPT API key                        |
| `DATABASE_URL`     | PostgreSQL connection string              |
| `EMAIL_SERVICE_KEY`| Email service for alerts and reports      |

---

## 🤝 Contributing

Contributions are welcome! If you find a bug or want to enhance the project, feel free to:

1. **Fork the repository**
2. **Create your feature branch**
   ```bash
   git checkout -b feature-name


## 🛠️ Installation

```bash
git clone https://github.com/your-username/ai-finance-platform.git
cd ai-finance-platform
npm install
npm run dev

