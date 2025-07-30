# 🧠 Tecspacs

A lightweight, visual snippet and mini-package manager for developers. Organize and reuse your favorite code like sticky notes on a digital sketchbook.

[🌐 View the deployed frontend here](https://frontend-nine-rosy-50.vercel.app/)

---

## 💡 Inspiration

Developers frequently reuse code snippets and mini utilities across projects, but organizing, reusing, and sharing them is often a hassle. Tools like `npm` or `pip` are too heavyweight for personal use, while note-taking apps like Notion aren’t designed for live code reuse. We set out to build a developer-first tool that’s light, visual, and fun—like pinning your favorite code onto a digital sketchbook.

---

## ⚙️ What It Does

**Tecspacs** is a personal and collaborative snippet/package manager. Developers can create and browse:

- **TECs** (code snippets)
- **PACs** (mini packages)

Key features include:

- Sticky-note style UI for browsing and creating snippets
- AI assistant for summarizing and improving code
- Authentication-ready UI (login/register/profile)
- CLI tool for managing TECs/PACs from terminal
- VS Code extension to integrate Tecspacs into your editor

---

## 🛠️ Tech Stack

### Frontend
- React
- JavaScript
- Tailwind CSS
- Auth0 (SPA SDK)

### Backend
- Node.js / Express (JavaScript)
- MongoDB Atlas

### Tools & Integrations
- AI Integration (Gemini API)
- Ngrok (for local tunneling during dev)
- CLI Tool (JavaScript)
- VS Code Extension (JavaScript)

---

## 🧱 How We Built It

- The frontend was built with **React** and **Tailwind CSS**, styled around a sticky-note sketchbook concept.
- We used **Auth0** to handle token-based authentication (fully implemented in UI).
- The backend is a **Node.js** REST API using **MongoDB Atlas** for storage.
- The **CLI tool** allows managing snippets/packages directly from the terminal.
- The **VS Code extension** connects to the same backend, providing a native IDE experience.
- We integrated **Gemini AI** to help summarize and improve snippets directly in the app.

---

## 🧪 Challenges We Faced

- Integrating **Auth0** across multiple platforms (frontend, CLI, VS Code) took extensive token management and debugging.
- Using **ngrok tunnels** during development led to complex CORS and header issues.
- Building a working **CLI** and **VS Code extension** from scratch required deep dives into unfamiliar ecosystems.

---

## 🏆 Accomplishments

- Built all 3 tools — **web app**, **CLI**, and **VS Code extension** — and successfully connected them to one backend.
- Created a **memorable visual identity** with sticky notes and sketchbook theme.
- Integrated a **fully functional AI assistant** with real-time feedback.

---

## 📚 What We Learned

- How to manage **full-stack authentication** with tokens.
- The complete development lifecycle of full-stack + CLI + IDE plugin.
- How to build AI-powered developer tools using real-time API calls.
- How to deploy and test cross-platform tools using services like **ngrok**, **Vercel**, and **MongoDB Atlas**.

---

## 🚀 What's Next

- Add snippet versioning (like GitHub commits).
- Allow pinning snippets to user profiles.
- Enable collaboration: shared PACs, co-authorship, and team collections.
- Switch between list/post views for TECs/PACs.
- Make the tool fully open source and community-maintained.

---

## 📎 Additional Links

- [🌐 Live App (Frontend)](https://frontend-nine-rosy-50.vercel.app/)
- [💻 GitHub Repo](https://github.com/rtrevizo18/tecspacs)
- [📦 Devpost Submission](https://devpost.com/software/data-hackfest-project?_gl=1*1kf8kvb*_gcl_au*MTc3MDg4OTMxMC4xNzUzMTI5ODA1*_ga*NDU1NzI0MzcuMTc1MzEyOTgwNQ..*_ga_0YHJK3Y10M*czE3NTM2MzQwMzYkbzkkZzEkdDE3NTM2MzQ2OTckajQ2JGwwJGgw)
- [▶️ Project Demo (Main)](https://www.youtube.com/watch?v=-PGgpiLr7Qo)
- [▶️ VS Code Extension Demo](https://www.youtube.com/watch?v=Kev3WkY52V4)
- [▶️ Extra Feature Walkthrough](https://www.youtube.com/watch?v=yfYKLxvTMZc)
