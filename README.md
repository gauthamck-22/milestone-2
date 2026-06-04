# Digital Healthcare Records & Appointment System Backend

A backend-only system built with Node.js, Express, JWT authentication, and MongoDB to manage patient registration, EMR, appointment scheduling, prescriptions, clinicians, and admin workflows.

## Features

- User registration and login for patients, clinicians, and admins
- bcrypt password hashing and JWT authentication
- Role-based authorization middleware
- Patient EMR create/read/update with audit logs
- Appointment scheduling with conflict detection
- Prescription creation, history, and fulfillment status
- Clinician profiles, availability, and patient assignment
- Admin user management and reporting endpoints

## Setup

1. Install dependencies:

```bash
npm install
```

2. Copy `.env.example` to `.env` and configure values:

```bash
copy .env.example .env
```

3. Start MongoDB locally or provide a connection string in `.env`.

4. Run the server:

```bash
npm run dev
```

## Seed command

Create initial users and test data:

```bash
npm run seed
```

## Environment Variables

- `MONGO_URI` - MongoDB connection string
- `JWT_SECRET` - Secret used to sign JWTs
- `PORT` - Server port (default `5000`)

## API Documentation

This project includes a sample Postman collection for endpoint testing in `postman_collection.json`.

## Notes

- Protect `.env` in a real deployment.
- Use HTTPS and a secure JWT secret in production.
- This repository is backend-only; a frontend or Postman client is required for testing requests.
