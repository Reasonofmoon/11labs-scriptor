# Vercel Deployment Guide

## 1. Create a Vercel Account
If you haven't already, sign up at [vercel.com](https://vercel.com/signup).

## 2. Import Project
1. Go to your [Vercel Dashboard](https://vercel.com/dashboard).
2. Click **"Add New..."** -> **"Project"**.
3. Select **"Import"** next to your GitHub repository: `Reasonofmoon/11labs-scriptor`.

## 3. Configure Project
Vercel will automatically detect that this is a Next.js project. You don't need to change the build settings.

## 4. Environment Variables (Critical!)
Before clicking "Deploy", expand the **"Environment Variables"** section.
Add the following variables (copy values from your local `.env.local`):

| Key | Description |
|-----|-------------|
| `ELEVENLABS_API_KEY` | Required for audio generation. |
| `GOOGLE_GEMINI_API_KEY` | Required for AI script generation (Gemini 2.5 Flash). |
| `OPENAI_API_KEY` | Optional. Used if Gemini key is missing. |

## 5. Deploy
Click **"Deploy"**. Vercel will build your application and assign it a domain (e.g., `11labs-scriptor.vercel.app`).

## 6. Verify
Once deployed, visit the URL and test the "Generate Immersive Audio" feature to ensure the API keys are working correctly.
