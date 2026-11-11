# Google Cloud Run Deployment Guide
## NCC Digital Cadet System — Unified Single-Container Deployment

This guide explains how to deploy your **NCC Digital Cadet System** to **Google Cloud Run** to generate a secure, public HTTPS URL for users.

---

## 1. Prerequisites & Required Tools

Before deploying, ensure you have installed:
1. [Google Cloud SDK (gcloud CLI)](https://cloud.google.com/sdk/docs/install)
2. [Docker Desktop](https://www.docker.com/products/docker-desktop/) (Required if building containers locally, or you can use Google Cloud Build directly)

---

## 2. Google Cloud Account & Permissions Setup

### A. Google Cloud Project Creation
1. Go to the [Google Cloud Console](https://console.cloud.google.com/).
2. Create a new project (e.g. `ncc-digital-cadet`).
3. Note your **Project ID** (e.g. `ncc-digital-cadet-123456`).

### B. Required IAM Permissions / Roles
Ensure your user account or Service Account has the following roles assigned:
- **Cloud Run Admin** (`roles/run.admin`)
- **Artifact Registry Admin** or **Storage Admin** (`roles/artifactregistry.admin` / `roles/storage.admin`)
- **Service Account User** (`roles/iam.serviceAccountUser`)
- **Cloud Build Editor** (`roles/cloudbuild.builds.editor`)

### C. Enable Google Cloud APIs
Run the following `gcloud` command to enable necessary APIs:
```bash
gcloud services enable run.googleapis.com artifactregistry.googleapis.com cloudbuild.googleapis.com --project=YOUR_PROJECT_ID
```

---

## 3. Environment Variables for Cloud Run

Set the following environment variables during Cloud Run service configuration:

| Environment Variable | Value | Purpose |
| :--- | :--- | :--- |
| `NODE_ENV` | `production` | Enables Express production mode & static serving |
| `PORT` | `8080` | Container port (automatically managed by Cloud Run) |
| `JWT_SECRET` | `your_secure_random_production_jwt_secret_key` | Secret key used for signing & validating auth tokens |
| `ALLOWED_ORIGINS` | `*` | Allowed CORS origins for browser security |

---

## 4. Deployment Commands (Step-by-Step)

### Option 1: Direct Cloud Build & Deploy (Recommended — No Local Docker Required)

Execute the following commands in your project root directory:

```bash
# 1. Authenticate gcloud CLI with your Google Account
gcloud auth login

# 2. Set your active Google Cloud Project ID
gcloud config set project YOUR_PROJECT_ID

# 3. Build container image and deploy directly to Cloud Run
gcloud run deploy ncc-digital-cadet \
  --source . \
  --region us-central1 \
  --allow-unauthenticated \
  --set-env-vars NODE_ENV=production,JWT_SECRET="ncc_sih2026_super_secret_jwt_key",ALLOWED_ORIGINS="*"
```

---

### Option 2: Docker Build & Push via Artifact Registry (Advanced)

If you prefer building the container image manually using local Docker:

```bash
# 1. Create an Artifact Registry repository for Docker containers
gcloud artifacts repositories create ncc-repo \
  --repository-format=docker \
  --location=us-central1 \
  --description="NCC Digital Cadet Container Repository"

# 2. Configure Docker authentication for Artifact Registry
gcloud auth configure-docker us-central1-docker.pkg.dev

# 3. Build Docker container image locally
docker build -t us-central1-docker.pkg.dev/YOUR_PROJECT_ID/ncc-repo/ncc-app:v1 .

# 4. Push container image to Google Artifact Registry
docker push us-central1-docker.pkg.dev/YOUR_PROJECT_ID/ncc-repo/ncc-app:v1

# 5. Deploy image to Google Cloud Run
gcloud run deploy ncc-digital-cadet \
  --image us-central1-docker.pkg.dev/YOUR_PROJECT_ID/ncc-repo/ncc-app:v1 \
  --region us-central1 \
  --platform managed \
  --allow-unauthenticated \
  --set-env-vars NODE_ENV=production,JWT_SECRET="ncc_sih2026_super_secret_jwt_key",ALLOWED_ORIGINS="*"
```

---

## 5. Public URL Verification

Upon successful execution, Google Cloud Run will output your live HTTPS public URL:
```text
Service [ncc-digital-cadet] revision [ncc-digital-cadet-00001-abc] has been deployed and is serving 100 percent of traffic.
Service URL: https://ncc-digital-cadet-xxxxxx-uc.a.run.app
```

### Verification Checklist:
1. Open `https://<your-service-url>.run.app` in any desktop/mobile browser to view the **NCC Digital Cadet Portal**.
2. Log in using test credentials (`username: ano`, `password: 1234`, `role: officer` or `username: NCC001`, `password: 9876543210`, `role: cadet`).
3. Verify that `/api/v1/health` returns `{"status":"OK", ...}`.
