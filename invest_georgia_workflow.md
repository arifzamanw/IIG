# Invest Georgia Real Estate CMS & Proposal Management Platform
## Complete System Workflow & Technical Architecture Blueprint

This document outlines the complete workflow, system architecture, data flow, and phased implementation order for the **Invest Georgia Platform**. It is designed as a direct technical prompt and reference architecture for AI IDEs (such as Cursor, Windsurf, or GitHub Copilot) to understand how modules interlock and prevent isolated CRUD generation.

---

## 1. High-Level Architecture & User Entry Workflow

```
                           ┌───────────────────┐
                           │      LOGIN        │
                           │ Email + Password  │
                           └─────────┬─────────┘
                                     │
                                     ▼
                         ┌─────────────────────┐
                         │ Authentication      │
                         │ JWT + RBAC Check    │
                         └─────────┬───────────┘
                                   │
                                   ▼
                         ┌─────────────────────┐
                         │     DASHBOARD      │
                         └─────────┬───────────┘
                                   │
             ┌─────────────────────┼─────────────────────┐
             │                     │                     │
             ▼                     ▼                     ▼
      [SUPER ADMIN]           [MARKETING]             [SALES]
             │                     │                     │
             ▼                     ▼                     ▼
 ┌─────────────────┐     ┌──────────────────┐   ┌──────────────────┐
 │ System Control  │     │ Property CMS     │   │ Proposal System  │
 └─────────────────┘     └──────────────────┘   └──────────────────┘
```

### Authentication & Access Control Core Specifications
*   **Authentication:** Stateless JSON Web Tokens (JWT) stored securely or session-based cookies.
*   **Role-Based Access Control (RBAC):**
    *   **Super Admin:** Full system control, user provisioning, audit logging, system-wide analytics, and database schema overrides.
    *   **Marketing:** Write/Edit access to Developers, Projects, Units, Media Library, and Global Master Data. No sales or proposal execution visibility.
    *   **Sales:** Read-only access to published Properties/Units. Full Write/Execute access to Customers CRM, Proposal Customization Engine, and PDF Generation Tooling.

---

## 2. Marketing Department Workflow (Content Management System)

```
                    MARKETING LOGIN ──► [ DEVELOPER CMS ]
                                               │
                                               ▼
                                    Create / Edit Developer
                                               │
                                               ▼
                              ┌────────────────────────────────┐
                              │ Developer Information          │
                              │ - Name, Logo, Description      │
                              │ - Contact, Website, Gallery    │
                              └────────────────┬───────────────┘
                                               │
                                               ▼
                                         Save Developer
                                               │
                                               ▼
                                      [ PROJECT CMS ]
                                               │
                                               ▼
                                      Create New Project
                                               │
                                               ▼
                              ┌────────────────────────────────┐
                              │ Project Information            │
                              │ - Name, Location, Completion   │
                              │ - ROI, Desc, Starting Price    │
                              └────────────────┬───────────────┘
                                               │
                                               ▼
                                    Upload Property Assets
                                               │
                                               ▼
                              ┌────────────────────────────────┐
                              │ Media Management               │
                              │ - Images, Floor Plans, Videos  │
                              │ - Brochures, Master Plans      │
                              └────────────────┬───────────────┘
                                               │
                                               ▼
                                     Add Project Details
                                               │
                                               ▼
                              ┌────────────────────────────────┐
                              │ - Amenities, Payment Plans     │
                              │ - Unit Types, Units, Docs      │
                              └────────────────┬───────────────┘
                                               │
                                               ▼
                                       Publish Project
                                               │
                                               ▼
                                   Available For Sales Team
```

### Core CMS Business Rules
1.  **Cascading Validation:** A Project cannot be created without being linked to an existing, validated Developer record.
2.  **Asset Scope:** All uploaded media must pass through an optimization pipeline (WebP conversion for images, secure S3/Cloud Storage path generation).
3.  **Publishing State Machine:** Projects exist in `Draft`, `Review`, or `Published` states. Only `Published` items flow down to the Sales Department's available inventory pool.

---

## 3. Property Data Structure Flow

```
  [ Developer ]
       │
       ▼
  [ Projects ]
       │
       ▼
  [ Buildings / Units ]
       │
       ▼
┌───────────────────────────────┐
│ Property Information Details  │
├───────────────────────────────┤
│ Pricing       │ Size (sq ft)  │
│ Bedrooms      │ Bathrooms     │
│ Floor         │ View          │
│ Availability  │ Payment Plan  │
└───────────────┬───────────────┘
                │
                ▼
      [ Proposal Generator ]
```

### Relational Entity Definitions
*   **Developer:** One-to-Many relation with Projects. Holds global developer tier metrics.
*   **Project:** One-to-Many relation with Units/Buildings. Contains baseline metadata (ROI, location coordinates, overall completion dates).
*   **Units:** Atomic inventory entity. Features structural status parameters (`Available`, `Reserved`, `Sold`) alongside localized spatial metrics.

---

## 4. Sales Department Workflow & Proposal Generation

```
                    SALES LOGIN ──► [ SALES DASHBOARD ]
                                            │
                                            ▼
                                    + CREATE PROPOSAL
                                            │
                                            ▼
                                     Select Customer
                                            │
                             ┌──────────────┴──────────────┐
                             ▼                             ▼
                     [Existing Customer]            [New Customer]
                             │                             │
                             └──────────────┬──────────────┘
                                            │
                                            ▼
                                     Select Developer
                                            │
                                            ▼
                                     Select Project
                                            │
                                            ▼
                                      Select Unit
                                            │
                                            ▼
                                SYSTEM LOADS DEFAULT DATA
                             ┌─────────────────────────────┐
                             │ Automatically Filled Fields │
                             ├─────────────────────────────┤
                             │ Project Name, Developer     │
                             │ Price, Size, ROI, Timeline  │
                             │ Amenities, Base Media       │
                             └──────────────┬──────────────┘
                                            │
                                            ▼
                                  Proposal Customization
                             ┌─────────────────────────────┐
                             │ Sales Editable Fields       │
                             ├─────────────────────────────┤
                             │ Final Price, Discretionary  │
                             │ Discount, Adjusted Payment  │
                             │ Selected Media, CRM Notes   │
                             └──────────────┬──────────────┘
                                            │
                                            ▼
                                     Choose Template
                                            │
                                            ▼
                                     Proposal Builder
                                            │
                                            ▼
                                       Generate PDF
                                            │
                                            ▼
                                      Save & Send
```

### Proposal System State Rules
*   **Data Immutability (Snapshotting):** Once a proposal is initiated, the system must create a deep-copy snapshot of the Project/Unit data into the proposal record. If Marketing updates a project price later, active historic sales proposals remain unaltered.
*   **Customization Limits:** Discretionary discounts cannot exceed thresholds defined by the Super Admin RBAC configs without throwing an validation error.

---

## 5. Technical Proposal Generation Pipeline

```
[ PROJECT DATABASE ] ──► [ Create Proposal Snapshot ]
                                 │
                                 ▼
                     ┌──────────────────────┐
                     │ Data Deep Copy       │
                     │ - Specs & Amenities  │
                     │ - Chosen Media       │
                     │ - Custom Pricing     │
                     └───────────┬──────────┘
                                 │
                                 ▼
                    [ Proposal Template Engine ]
                                 │
                                 ▼
                     [ HTML Proposal Layout ]
                                 │
                                 ▼
                    [ Puppeteer / PDF Engine ]
                                 │
                                 ▼
                     [ Final PDF Document ]
```

### Compilation Specifications
1.  **Template Engine:** Merges customer metadata, dynamic pricing matrix, and active markdown/HTML layout selections.
2.  **PDF Engine:** Uses a headless print-renderer (e.g., Puppeteer) utilizing explicit print CSS page rules (`@page`, page-break isolation blocks) to compile design components to binary output.

---

## 6. Document Pagination & Visual Architecture

```
PAGE 1: Cover & Offer Summary
┌────────────────────────────────────────────────────────┐
│ Brand Header | Sales Offer Summary                     │
│ Project Context, Dynamic Price Metrics, Target ROI    │
└────────────────────────────────────────────────────────┘
                           │
                           ▼
PAGE 2: Curated Media Assets
┌────────────────────────────────────────────────────────┐
│ Visual Identity Grid                                   │
│ Hero Renderings, Context Imagery                       │
└────────────────────────────────────────────────────────┘
                           │
                           ▼
PAGE 3: Engineering Layouts & Architectural Visuals
┌────────────────────────────────────────────────────────┐
│ Unit Layout Grid                                       │
│ High-Resolution Floor Plans, Dimensional Specs         │
└────────────────────────────────────────────────────────┘
                           │
                           ▼
PAGE 4: Value Matrix & Neighborhood Overview
┌────────────────────────────────────────────────────────┐
│ Structural Amenities | Location Map | ROI Highlights   │
└────────────────────────────────────────────────────────┘
                           │
                           ▼
FINAL PAGE: Call to Action & Account Representation
┌────────────────────────────────────────────────────────┐
│ Representative Contact Cards | QR Transaction Routing  │
│ Terms & Conditions Disclaimer Block                    │
└────────────────────────────────────────────────────────┘
```

---

## 7. Global Data Flow

```
 [ MARKETING ] ──► Developer ──► Projects ──► Units ──► Pricing ──► Media
                                                                    │
                                                                    ▼
 [ CUSTOMER ] ◄── PDF ◄── Proposal Generator ◄── Sales UI ◄── [ DATABASE ]
```

---

## 8. System Module Map (Directory Structure Target)

Use this folder topology to structure the codebase cleanly:

```text
invest-georgia-cms/
├── app/
│   ├── core/
│   │   ├── auth/             # JWT, RBAC Middleware, Password Hashing
│   │   ├── database/         # Connections, Migrations, Seeders
│   │   └── security/         # Encryption, Rate Limiters
│   ├── modules/
│   │   ├── dashboard/        # Multi-role aggregate view engines
│   │   ├── users/            # Account provisioning & permissions
│   │   ├── developers/       # Developer brand CMS components
│   │   ├── projects/         # Project schemas, locations, amenities
│   │   ├── units/            # Real estate inventory and sizing structures
│   │   ├── media/            # Asset pipeline, optimization, storage layers
│   │   ├── customers/        # Sales Lead tracking and interaction records
│   │   └── proposals/        # Snapshot engine, builder, layout configuration
│   ├── services/
│   │   ├── pdf/              # Puppeteer engine configuration
│   │   └── notifications/    # Email/CRM alerts dispatchers
│   └── shared/               # Reusable utility scripts & middleware
```

---

## 9. AI IDE Phased Implementation Roadmap

Follow this precise execution timeline when configuring building blocks. Ensure tests pass for the prior phase before initializing subsequent phases:

### Phase 1: Core Foundation & Security Infrastructure
*   Initialize database schema models.
*   Implement JWT-based Authentication layer.
*   Establish RBAC middleware asserting permissions across `Super Admin`, `Marketing`, and `Sales`.

### Phase 2: Operations Dashboard & User Management
*   Build shell layout with multi-role entry-point redirects.
*   Expose user accounts CRUD configuration modules accessible exclusively to `Super Admin`.

### Phase 3: Brand & Context Master Data CMS
*   Build Developer entity management tables.
*   Implement shared taxonomies: global location hierarchies, dynamic amenity asset lookup maps.

### Phase 4: Inventory Matrix & Financial Architecture
*   Deploy Project management pipelines mapped to assigned Developers.
*   Create detailed Unit inventories linked to parent projects, detailing structural attributes and localized availability tracking models.

### Phase 5: Distributed Digital Asset Infrastructure
*   Configure the Media Library backend handling validation and structured asset storage.
*   Wire multi-file blueprint, floor plan, and legal document bindings to project models.

### Phase 6: Customer Context & Sales Pipeline Integration
*   Implement Customers CRM module managing accounts, contact info, and transaction readiness tracking flags.
*   Wire the base Sales Interface layout displaying available inventory matrices.

### Phase 7: Document Synthesis Engine & Custom Proposals
*   Build Proposal Snapshot logic ensuring zero downstream regression vulnerabilities from live property pricing updates.
*   Configure the HTML layout styling layers inside the PDF template selection engine.
*   Wire the Puppeteer engine service to output valid, paginated document streams.

### Phase 8: Operations Analytics, Notifications, & Audit Trails
*   Deploy analytics telemetry calculating conversion metrics, popular properties, and individual sales target logs.
*   Implement system event audit logs mapping mutating administrative actions.
*   Finalize optimization layers, index queries for high-performance retrieval, and clean environment footprints.
