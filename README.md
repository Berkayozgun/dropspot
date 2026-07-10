# 🚀 DropSpot - Limited Stock & Waitlist Platform

![Next.js](https://img.shields.io/badge/Next.js-16-black?style=for-the-badge&logo=next.js&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white)
![Tailwind](https://img.shields.io/badge/Tailwind-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)

A specialized full-stack e-commerce solution designed for limited stock product drops and real-time waitlist management. Built to handle traffic spikes during launch windows, ensuring fair access and high availability.

## 🏗️ Engineering Highlights

* **Launch-Ready Architecture:** High-availability frontend architecture built with Next.js 16 to handle concurrent user requests during limited stock drops.
* **Waitlist Logic:** Optimized backend-side waitlist queue management ensuring data consistency and fairness in product claims.
* **Dockerized Deployment:** Fully containerized environment using Docker Compose, ensuring identical behavior across development and production stages.
* **Interactive UI:** Responsive and dynamic user experience utilizing Tailwind CSS for high-fidelity brand presentation.

## 🚀 Quick Start

### 1. Clone & Install
```bash
git clone https://github.com/Berkayozgun/dropspot.git
cd dropspot
npm install
```

### 2. Docker Execution (Recommended)
Launch the entire stack including dependencies:
```bash
docker-compose up --build
```

### 3. Development Mode
```bash
npm run dev
```

## 🧪 Automated Checks
This repository is equipped with **GitHub Actions**. Every push to the `main` branch automatically triggers a CI workflow to validate the build process and dependency integrity, ensuring robust deployments.
