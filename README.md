# Mini E-Commerce App – Next.js Skill Test

## Overview
This project is a mini e-commerce application built using Next.js (App Router) as part of a technical skill test.  
It focuses on SSR, authentication, GSAP animations, and clean API integration.

## Tech Stack
- Next.js (App Router)
- TypeScript
- Tailwind CSS
- Zustand
- GSAP
- Axios
- JWT Authentication

## Key Features
- Server-side rendered Navbar, Footer, Product Listing
- Token-based authentication (JWT)
- Route protection using Next.js middleware
- GSAP hover animations on product cards
- Responsive UI (Desktop & Mobile)
- Clean separation of server and client logic

## Authentication Flow
- Phone number login with OTP
- New user registration if not found
- JWT stored in cookies
- Protected routes redirect unauthenticated users
- Logout clears authentication

## API Integration
- REST APIs integrated as provided
- Server-side API usage for SSR pages
- Client-side API usage for interactive actions

## Animations
- GSAP used for product card hover animation
- CSS-only animations are avoided

## Deployed URL
https://test-ecommerce-ruby.vercel.app/

## Setup
```bash
npm install
npm run dev