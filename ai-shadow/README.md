# AI Shadow — Career Intelligence System

> **Your job. Audited. Before the market moves.**

AI Shadow analyzes your daily tasks, identifies which ones are at risk of automation, predicts future skill demands, and generates a personalized career evolution timeline — powered by Google Gemini 2.5 Flash.

---

## What It Does

- **AI Shadow Simulator** — Decomposes your daily tasks into units, classifies each as Creative, Strategic, or Routine, and assigns an exact automation percentage per task
- **Automation Risk Score** — Gives you a 0–100% risk score for your overall role
- **Predictive Skill Gap Engine** — Maps current vs 12-month future skill demand and highlights what you need to learn
- **Career Evolution Timeline** — Shows how your role transforms over Now → 6 months → 12 months
- **Future Career Advice** — Generates a specific, role-aware action plan

---



## Tech Stack

| Layer | Technology |
|---|---|
| Framework | React 18 |
| Bundler | Vite |
| Styling | CSS-in-JS (no external framework) |
| AI Model | Google Gemini 2.5 Flash |
| API | Gemini Generative Language REST API |
| Charts | Custom SVG + CSS animations |
| Deployment | Vercel |

---

## Project Structure

```
ai-shadow/
├── src/
│   └── App.jsx          # Main application — all components and logic
├── public/
├── .env                 # Your API key (never committed)
├── .env.example         # Placeholder — safe to commit
├── .gitignore
├── index.html
├── package.json
├── vite.config.js
└── README.md
```

---

## How It Works

1. User enters their **job role**, **experience level**, and **daily tasks**
2. A structured prompt is built and sent to **Gemini 2.5 Flash** via REST API
3. Gemini returns a structured JSON object with risk scores, task classifications, skill gaps, and career advice
4. React renders the **analysis dashboard** with visual components

```
User Input → Prompt Builder → fetch() → Gemini API → JSON Parse → Dashboard
```

---


## Built With

This project was built as a prototype for **Chakravyuha 1.0** — National Hackathon organized by the Department of Computer & Communication Engineering, Sri Sai Ram Institute of Technology, Chennai.

