# 🏨 VAGUE Resort - AI-Powered Hospitality Management System

Welcome to the future of resort management. **VAGUE Resort** is a cutting-edge HMS designed for high-end boutique properties, integrating enterprise-scale resource management with real-time AI workforce intelligence.

---

## 🚀 The Winning Edge: Key Features

### 1. 🤖 AI-Driven Workforce Intelligence
Our system doesn't just store schedules; it **thinks**. 
- **Occupancy Correlation**: Real-time integration between the `Bookings` engine and the `Staffing` module.
- **Predictive Staffing**: Powered by **Groq (Llama-3)**, the system analyzes guest occupancy rates and upcoming events to recommend optimal staffing levels.
- **Automated Understaffing Alerts**: Visually flags departments where current shift assignments don't meet AI-calculated luxury standards.

### 2. 🗓️ Smart Scheduling & Resource Management
A unified dashboard for handling the complexity of resort operations.
- **Departmental Logic**: Granular control over Executive, Culinary, Front-of-House, and Facilities teams.
- **Interactive Calendar**: Full-property event and shift tracking.
- **Unified Identity**: Seamless integration between hotel guests, rooms, and staff profiles.

### 3. 🛌 Modern Booking & Accommodations
- **Real-time Inventory**: 70+ rooms across Standard, Deluxe, and Suite categories.
- **Smart Showcase**: Dynamic homepage storefront fetching live inventory prices and high-resolution visuals.

---

## 🛠️ How to Review (Judges' Guide)

### Step 1: Initialize the Ecosystem
Run our **Unified Global Seed** to populate the hotel with 144+ staff, 70 rooms, and 30 simulated bookings for the AI to analyze.
```bash
node scripts/standalone-seed.js
```

### Step 2: Explore Workforce Intelligence
Navigate to [`/admin/staffing`](http://localhost:3000/admin/staffing)
- **Select a Department** (e.g., Culinary & Banquets).
- **Run AI Forecast**: Observe how the system calculates demand based on the check-ins we seeded. 
- **Observe the Ratio**: High occupancy days will trigger "Critical" or "Optimal" staffing recommendations.

### Step 3: Manage the Resort
Navigate to [`/admin/scheduling`](http://localhost:3000/admin/scheduling)
- View the **Property Overview** stats.
- Drill down into **Members** or **Departments** to see the enterprise-scale data structure.

### Step 4: Guest Perspective
Visit the [Homepage](http://localhost:3000/)
- Scroll to **Our Accommodations**.
- Interact with the **Real-time Room Inventory** cards (Standard/Deluxe/Suite) linked directly to the booking engine.

---

## 🏗️ Technical Stack
- **Framework**: Next.js 15+ (App Router)
- **Database**: MongoDB (Mongoose)
- **AI Stack**: Groq SDK (Llama-3-70b/8b)
- **Styling**: Tailwind CSS 4, Framer Motion, GSAP
- **Auth**: NextAuth.js

---
*Created for the 2024 AI/Hospitality Hackathon*
