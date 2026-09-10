# Customer Support Helpdesk & Ticketing System

A role-based customer support helpdesk and ticketing system built for
the CIA-3 project for **Advanced JavaScript Backend Frameworks (Node.js
& Express JS)**.

The system allows customers to create and track support tickets, agents
to manage assigned tickets, and managers to assign tickets, manage
categories, handle escalations, and monitor SLA/CSAT analytics.

## Project Overview

The system provides a complete ticket lifecycle:

**Open → In Progress → Resolved → Closed**

It also includes:

-   JWT-based authentication
-   Role-Based Access Control (RBAC)
-   Customer, Agent, and Manager roles
-   Ticket creation and category validation
-   Ticket assignment
-   Search, filtering, sorting, and pagination
-   SLA deadline calculation and breach detection
-   Ticket priority management
-   Multi-level escalation workflow
-   Append-only escalation history
-   Public customer/agent reply threads
-   Agent/manager-only internal notes
-   Customer Satisfaction (CSAT) ratings
-   Agent workload and manager analytics
-   Centralized validation and error handling
-   React frontend dashboard

## Technology Stack

### Backend

-   Node.js
-   Express.js 5
-   MongoDB
-   Mongoose 9
-   JSON Web Tokens (JWT)
-   bcryptjs
-   express-validator
-   dotenv

### Frontend

-   React 19
-   Vite
-   React Router
-   Tailwind CSS
-   lucide-react

### Testing & Deployment

-   Postman
-   Render

## System Architecture

The project follows an MVC-style backend architecture:

``` text
customer-support-helpdesk/
│
├── controllers/       # Business logic and request handling
├── middleware/        # Authentication, authorization, validation, errors
├── models/            # Mongoose database models
├── routes/            # API route definitions
├── utils/             # Reusable utilities such as SLA calculations
├── frontend/          # React + Vite + Tailwind frontend
├── .env               # Environment variables (not committed)
├── .gitignore
├── package.json
└── README.md
```

## User Roles

### Customer

-   Register and log in
-   Create support tickets
-   View and track own tickets
-   Reply through the public conversation
-   Escalate stalled tickets
-   Submit a 1--5 CSAT rating after resolution

### Agent

-   View assigned tickets
-   Reply to customers
-   Add internal notes
-   Update ticket status
-   Resolve assigned tickets

### Manager

-   Assign and reassign tickets
-   Change ticket priority
-   Manage ticket categories
-   Review escalations
-   Manage escalation outcomes
-   View SLA, workload, escalation, and CSAT analytics

## Main Features

### 1. Authentication & RBAC

Users authenticate using JWT tokens. Passwords are hashed using
bcryptjs.

Protected routes verify the JWT before accessing controller logic, while
role-based middleware restricts manager/agent-only operations.

### 2. Ticket Management

Customers can create tickets with:

-   Subject
-   Description
-   Category
-   Priority

The server validates the category and calculates the SLA deadline.

### 3. Ticket Status Lifecycle

Tickets cannot skip lifecycle stages.

``` text
Open
  ↓
In Progress
  ↓
Resolved
  ↓
Closed
```

Invalid status transitions are rejected by the backend.

### 4. SLA Management

SLA targets depend on ticket priority:

  Priority   SLA
  ---------- ----------
  Low        48 hours
  Medium     24 hours
  High       8 hours
  Urgent     4 hours

When a ticket's priority changes while it is Open or In Progress, its
SLA deadline is recalculated using the original ticket creation time.

### 5. Escalation

Customers, assigned agents, and managers can trigger an escalation with
a reason.

Every escalation event and manager review is added to an append-only
`escalationHistory`, creating an audit trail instead of overwriting
previous events.

### 6. Public Comments and Internal Notes

Public comments are visible to the customer, assigned agent, and
manager.

Internal notes are restricted to agents and managers and are not exposed
to customers.

### 7. CSAT

Customers can submit a rating from **1 to 5** after a ticket reaches
Resolved or Closed.

Only one satisfaction rating is allowed per ticket.

### 8. Analytics

The manager analytics module provides information such as:

-   Agent workload
-   Active ticket load
-   SLA breaches
-   Escalations
-   Average resolution time
-   Organisation-wide ticket reports
-   CSAT statistics

## API Overview

### Authentication

  Method   Endpoint               Access
  -------- ---------------------- -----------------
  POST     `/api/auth/register`   Public
  POST     `/api/auth/login`      Public
  GET      `/api/auth/me`         Authenticated
  GET      `/api/auth/agents`     Agent / Manager

### Categories

  Method   Endpoint                       Access
  -------- ------------------------------ ------------------------
  GET      `/api/categories`              Public / Authenticated
  POST     `/api/categories`              Manager
  PUT      `/api/categories/:id`          Manager
  PATCH    `/api/categories/:id/status`   Manager

### Tickets

  Method   Endpoint                               Access
  -------- -------------------------------------- -----------------
  GET      `/api/tickets`                         Authenticated
  POST     `/api/tickets`                         Customer
  GET      `/api/tickets/:id`                     Authenticated
  GET      `/api/tickets/:id/sla`                 Authenticated
  PUT      `/api/tickets/:id/assign`              Manager
  PUT      `/api/tickets/:id/status`              Agent / Manager
  PUT      `/api/tickets/:id/priority`            Manager
  POST     `/api/tickets/:id/escalate`            Authenticated
  PUT      `/api/tickets/:id/escalation-review`   Manager
  POST     `/api/tickets/:id/comments`            Authenticated
  GET      `/api/tickets/:id/comments`            Authenticated
  POST     `/api/tickets/:id/notes`               Agent / Manager
  GET      `/api/tickets/:id/notes`               Agent / Manager
  POST     `/api/tickets/:id/satisfaction`        Customer
  GET      `/api/tickets/:id/satisfaction`        Authenticated

### Analytics & Utility

  Method   Endpoint                           Access
  -------- ---------------------------------- -----------------
  GET      `/api/analytics/agent-workload`    Agent / Manager
  GET      `/api/analytics/manager-reports`   Manager
  GET      `/api/health`                      Public

## Installation

### Prerequisites

Make sure the following are installed:

-   Node.js
-   npm
-   MongoDB or a MongoDB Atlas database

### 1. Clone the repository

``` bash
git clone https://github.com/Nihitha47/Customer_Support_Helpdesk-Ticketing_System.git
cd Customer_Support_Helpdesk-Ticketing_System
```

### 2. Install backend dependencies

``` bash
npm install
```

### 3. Configure environment variables

Create a `.env` file in the project root.

Example:

``` env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
```

Do not commit `.env` to GitHub.

### 4. Start the backend

``` bash
node server.js
```

The API will run on the configured port.

### 5. Start the frontend

``` bash
cd frontend
npm install
npm run dev
```

## Testing

The backend was verified using Postman against both the local server and
the deployed Render backend.

Representative flows include:

1.  Customer registration
2.  Customer login
3.  JWT Bearer authentication
4.  Authenticated profile retrieval
5.  Category-validated ticket creation
6.  Server-side SLA deadline calculation
7.  Ticket assignment
8.  Status lifecycle updates
9.  Escalation workflow
10. Public comments and internal notes
11. CSAT submission
12. Analytics endpoints

## Example Ticket Workflow

``` text
Customer
   │
   ├── Create Ticket
   │
   ▼
OPEN
   │
   ├── Manager assigns Agent
   │
   ▼
IN PROGRESS
   │
   ├── Agent works on issue
   │
   ▼
RESOLVED
   │
   ├── Customer reviews resolution
   │
   ▼
CLOSED
```

## Security

The project implements several security practices:

-   Password hashing using bcryptjs
-   JWT authentication
-   Role-based authorization
-   Per-ticket ownership checks
-   Server-side request validation
-   Environment variables for secrets
-   `.env` excluded through `.gitignore`
-   Centralized error handling


## Deployment

The backend is deployed on Render and verified using Postman.

### Live Application
https://p14-helpdesk-frontend.onrender.com

### Backend API
https://customer-support-helpdesk-ticketing.onrender.com

The repository also contains a companion React frontend under:

`/frontend`
## Project Team

| Team Member | Register Number |
|-------------|-----------------|
| George Thomas | 2462072 |
| Femi K E | 2462069 |
| Gokulakrishnan | 2462075 |
| Gutha Nihitha | 2463021 |

## Important Notes

-   Email/SMS notifications are currently outside the project scope.
-   SLA breach detection is evaluated when the ticket is read or updated
    rather than through a background scheduled job.
-   Automated Jest/Supertest testing is not included; verification was
    performed through Postman.
-   JWT tokens currently use a fixed 1-day expiry and there is no
    refresh-token mechanism.

## Repository

GitHub Repository:

https://github.com/Nihitha47/Customer_Support_Helpdesk-Ticketing_System

## License

This project was developed as an academic project for the CIA-3
assessment.
