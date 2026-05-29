# Decisions & Trade-offs

This document outlines the major design decisions, assumptions, and trade-offs made while building the ESG Emissions Tracker prototype. Given the limited development timeline and the ambiguity of real-world enterprise requirements, several pragmatic choices were made to balance scalability, maintainability, and deployment constraints.

---

# 1. Ambiguities & Technical Choices

## Decoupled Architecture

### The Ambiguity

I could have built the entire application using Django templates and server-rendered pages. This monolithic approach would have been faster to implement and deploy within the project timeline.

### My Choice

I chose a decoupled architecture consisting of:

* Django REST Framework backend
* React + Vite frontend

This decision also aligned directly with the requirements specified in the assignment.

### The Why

Enterprise applications typically require independent scaling of frontend and backend services.

By separating concerns:

* The React frontend can be deployed to a CDN for fast global delivery.
* The Django backend can focus exclusively on business logic and data processing.
* Frontend and backend teams can work independently in future iterations.
* Additional clients (mobile apps, BI tools, external integrations) can consume the same API layer.

Although this introduced additional complexity during development, it provides a more production-ready architecture.

---

## Dealing with Massive Datasets in the Cloud

### The Ambiguity

The datasets used for simulation contain hundreds of thousands to millions of records.

Uploading gigabyte-scale CSV files to a free-tier cloud environment would:

* Increase deployment size significantly
* Cause slow startup times
* Risk memory exhaustion
* Make the application difficult to demonstrate reliably

### My Choice

I implemented an **In-Memory Fallback Strategy** directly within the backend service layer.

Large datasets are excluded from version control and cloud deployments.

When the backend cannot locate a dataset, it automatically generates representative sample data rather than failing.

### The Why

The primary goal of this prototype is to demonstrate:

* Data ingestion workflows
* Normalization logic
* Dashboard functionality
* Audit capabilities

A deployment failure due to missing datasets would prevent evaluation of these features.

The fallback mechanism ensures the application remains functional in constrained environments while preserving the overall architecture.

---

# 2. Data Triage: What I Kept vs. Ignored

Real-world datasets contain a significant amount of information that is not relevant to ESG reporting.

To keep the system focused and performant, only fields directly contributing to carbon accounting were retained.

---

## A. ASHRAE – Great Energy Predictor III

### Scope

**Scope 2 — Purchased Electricity**

### What I Kept

* Building IDs
* Site identifiers
* Timestamps
* Electricity meter readings (`meter_reading`)

### What I Ignored

* Weather observations
* Wind speed
* Sea-level pressure
* Air temperature
* Environmental metadata

### The Why

While weather conditions influence energy consumption patterns, ESG reporting ultimately requires the amount of electricity consumed.

The additional environmental variables are valuable for forecasting models but do not materially impact carbon accounting calculations in this MVP.

---

## B. Flight Price Prediction Dataset

### Scope

**Scope 3 — Business Travel**

### What I Kept

* Source location
* Destination location
* Flight duration
* Estimated travel distance

### What I Ignored

* Ticket prices
* Airline brands
* Layover information
* Booking details

### The Why

Carbon emissions from air travel are primarily determined by distance traveled and fuel consumption.

Commercial pricing data has little relevance to emissions calculations and would unnecessarily increase model complexity.

The dataset was therefore reduced to transportation activity data only.

---

## C. SAP Big Query Dataset

### Scope

**Scope 1 & Scope 3 — Procurement and Operations**

### What I Kept

* Procurement quantities
* Facility locations
* Operational activity records
* Raw material consumption data

### What I Ignored

* Financial transaction identifiers
* Personally Identifiable Information (PII)
* Employee records
* Supplier names
* Internal accounting metadata

### The Why

The objective was to simulate enterprise ERP integration while minimizing unnecessary security and privacy risks.

Carbon accounting requires operational activity data rather than sensitive financial or personal information.

Removing these fields also improves compliance with privacy-by-design principles.

---

# 3. Questions for the Product Manager

Several assumptions were made during development to keep the prototype moving forward.

Before building a production version, I would seek clarification on the following requirements.

---

## Dynamic vs. Static Emission Factors

### Current Assumption

Emission conversion factors are stored within the backend and applied consistently across all calculations.

### Open Question

Should organizations be allowed to:

* Update emission factors themselves through an administrative interface?
* Upload country-specific conversion factors?
* Maintain historical factor versions for audit purposes?

Or should conversion factors remain centrally managed to ensure reporting consistency?

---

## Access Control and Data Visibility

### Current Assumption

All authenticated users can access the available emissions data.

### Open Question

Should visibility be restricted based on:

* Geographic region
* Facility location
* Department
* Business unit

Additionally, should there be separate roles such as:

* Analyst
* Reviewer
* Auditor
* Administrator

with different levels of access?

---

## Data Override and Approval Workflow

### Current Assumption

Users can modify imported records directly.

### Open Question

If a user edits imported SAP, utility, or travel data:

* Should changes take effect immediately?
* Should a second user review and approve the modification?
* Should original values remain visible alongside overridden values?

A formal approval workflow may be required for compliance-sensitive environments.

---

# Conclusion

Throughout development, the focus was on creating a prototype that demonstrates:

* Enterprise-scale data ingestion
* ESG-focused normalization
* Auditability and traceability
* Multi-source emissions reporting
