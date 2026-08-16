# Sahan

Sahan is a learning and creator platform built for people who want to **learn anything, teach anything, and sell knowledge** from one place.

## Product direction

Sahan is inspired by the best parts of community-first learning platforms, but is designed to go further:

- Courses and structured learning paths
- Individual lessons that can be sold independently
- Video, article, audio, files, quizzes and assignments
- Live classes, workshops and coaching
- Communities, discussions and creator-led spaces
- Student progress and completion tracking
- Certificates
- Creator analytics, audience and revenue tools
- Marketplace for buying and selling knowledge
- Membership-ready architecture
- Buy/Sell are intentionally separated, with **Buy as the default**

## Repository

The application lives in `sahan-app/` and is the source of truth for the Sahan product.

## Database

Sahan's learning marketplace schema is stored in the SAHAL Supabase project. It includes profiles, communities, courses, sections, lessons, enrollments, lesson progress, orders, posts and live sessions with row-level security enabled.

## Run locally

```bash
cd sahan-app
npm install
npm run dev
```

## Creator model

A creator can publish a full course, a single lesson, a live experience or a community. Products can be free or paid. The architecture keeps content, learners, community and transactions separate so the platform can grow without locking the creator into one format.
