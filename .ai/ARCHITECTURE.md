# ARCHITECTURE.md

# THE BREAKDOWN OS

Architecture Documentation

Version: 1.0

Status: Living Document

Owner: Engineering

Last Updated: 2026

---

# PURPOSE

This document defines the official architecture of The Breakdown OS.

It exists to ensure that every engineer, AI agent, and contributor builds upon a consistent, scalable, and maintainable foundation.

This document takes precedence over assumptions.

If code and documentation disagree, update the documentation or raise an Architecture Decision Record (ADR).

---

# ARCHITECTURAL PHILOSOPHY

The Breakdown is not a traditional content website.

It is a Knowledge Operating System.

The architecture is designed around these principles:

• Single Source of Truth
• Domain-Driven Design
• Separation of Concerns
• Evidence-first Data
• Service-Oriented Architecture
• Type Safety
• Accessibility by Default
• Incremental Evolution
• AI-Augmented Workflows
• Long-term Maintainability

---

# HIGH LEVEL ARCHITECTURE

                            ┌──────────────────────────┐
                            │        Browser           │
                            └────────────┬─────────────┘
                                         │
                                         ▼
                           ┌────────────────────────────┐
                           │        Next.js 15          │
                           │     React App Router       │
                           └────────────┬───────────────┘
                                        │
         ┌──────────────────────────────┼───────────────────────────────┐
         ▼                              ▼                               ▼
 Components                    Server Components                 API Routes
         │                              │                               │
         └──────────────┬───────────────┴───────────────┬───────────────┘
                        ▼                               ▼
                  View Models                     Service Layer
                        │                               │
                        └──────────────┬────────────────┘
                                       ▼
                            Repository Pattern
                                       │
                                       ▼
                               Supabase / PostgreSQL

Shared Infrastructure

• Canonical Types
• Knowledge Graph
• Event Bus
• Analytics Plugins
• AI Layer

---

# TECHNOLOGY STACK

Frontend

• Next.js 15
• React 19
• TypeScript
• Tailwind CSS

Backend

• Supabase
• PostgreSQL

Infrastructure

• Cloudflare
• Vercel

Version Control

• GitLab

Deployment

• GitLab CI
• Vercel
• Cloudflare CDN

---

# APP ROUTER

The platform uses the Next.js App Router.

Routing responsibilities:

• Server Components by default
• Client Components only when interactive
• Streaming whenever practical
• Route Groups
• Dynamic Routes
• Layouts
• Metadata API

Rules

✓ Prefer Server Components

✓ Avoid unnecessary "use client"

✓ Fetch on the server

✓ Stream large pages

---

# COMPONENT ARCHITECTURE

Hierarchy

Page

↓

Section

↓

Container

↓

Component

↓

Primitive

Primitives

Button

Card

Badge

Heading

Grid

Stack

Container

Never duplicate primitives.

---

# SERVICE LAYER

Business logic lives here.

Services never render UI.

Responsibilities

• Business Rules

• Validation

• Orchestration

• Analytics

• Search

• AI

• Graph

Components should call services rather than implementing domain logic.

---

# REPOSITORY PATTERN

Repositories isolate persistence.

Example

Component

↓

Service

↓

Repository

↓

Supabase

↓

Database

Benefits

• Testability

• Replaceable backend

• Cleaner architecture

Never query the database directly from components.

---

# CANONICAL TYPES

Single Source of Truth

types/canonical.ts

Contains

Story

Topic

Entity

Timeline

Dataset

Media

Evidence

Source

Relationship

User

Analytics

Never redefine these elsewhere.

---

# VIEW MODELS

Purpose

Adapt domain models for presentation.

Flow

Repository

↓

Service

↓

View Model

↓

React Component

View Models contain presentation shaping only.

Business logic belongs in Services.

---

# KNOWLEDGE GRAPH

Purpose

Represent relationships between knowledge objects.

Nodes

Story

Topic

Entity

Dataset

Timeline

Author

Organization

Edges

mentions

related

belongs_to

supports

contradicts

updated_by

used_in

Graph Service

Responsible for

Traversal

Recommendations

Relationship discovery

Future semantic search

---

# EVENT BUS

Purpose

Loose coupling.

Publish

↓

Subscribe

↓

Consumers

Events

Story Published

Topic Updated

Entity Added

Evidence Verified

Analytics Event

Search Event

Never tightly couple modules.

---

# ANALYTICS

Architecture

Component

↓

PluginAnalyticsService

↓

Plugins

↓

Providers

Providers

Console

Memory

PostHog

Mixpanel

GA4

Future providers require plugins only.

---

# AI LAYER

AI is an assistant.

Not the source of truth.

Components

Editorial AI

Reader AI

Research Workspace

Knowledge Graph AI

Claim Verification

Future

RAG

MCP

Semantic Search

Agent Workflows

All AI output must remain reviewable.

---

# REST API

Versioned

/api/v1

Principles

Stable

Documented

Typed

Predictable

Never introduce breaking changes without versioning.

---

# CMS

Structured Content

Story

↓

Evidence

↓

Sources

↓

Timeline

↓

Entities

↓

Topics

↓

Publish

Content is structured, not free-form.

---

# SEARCH

Current

Keyword Search

Entity Search

Topic Search

Future

Semantic Search

Vector Search

Knowledge Graph Search

Hybrid Retrieval

---

# AUTHENTICATION

Provider

Supabase Auth

Future

OAuth

OIDC

WebAuthn

Rules

Never bypass authorization.

Never expose tokens.

---

# SECURITY

Principles

Least Privilege

Input Validation

Output Encoding

Rate Limiting

Secrets Management

OWASP Alignment

Never commit secrets.

---

# PERFORMANCE

Targets

Lighthouse >95

Accessibility >95

SEO >95

Best Practices >95

Largest Component

<250 lines

Largest Bundle

Measured continuously

Optimize after measurement.

---

# DEPLOYMENT

Developer

↓

GitLab Branch

↓

Merge Request

↓

GitLab CI

↓

Typecheck

↓

Lint

↓

Tests

↓

Build

↓

Deploy Preview

↓

Production

Infrastructure

GitLab

↓

Vercel

↓

Cloudflare

↓

Supabase

---

# OBSERVABILITY

Current

Logs

Analytics

Future

OpenTelemetry

Sentry

Performance Monitoring

Tracing

Metrics

---

# TESTING STRATEGY

Unit

Integration

Component

End-to-End

Accessibility

Visual Regression

Performance

Every feature should be verifiable.

---

# ENGINEERING PRINCIPLES

Prefer

Composition

Small Components

Plugin Architectures

Typed APIs

Dependency Injection

Canonical Types

Avoid

God Components

Duplicate Types

Parallel Systems

Business Logic in UI

Large Pull Requests

---

# QUALITY GATES

Every Merge Request must pass

✓ TypeScript

✓ ESLint

✓ Tests

✓ Build

✓ Accessibility

✓ Documentation

✓ ADR (if architecture changes)

---

# REACT SERVER COMPONENT BOUNDARY

Server Component

↓

Service

↓

View Model

↓

Serializable Props

↓

Client Component

↓

Interactive UI

Never

Client

↓

Service

↓

Repository

↓

Database

---

# FUTURE ARCHITECTURE (2030–2045)

The Breakdown OS will evolve toward:

• Global Knowledge Graph
• Semantic Search Engine
• AI Research Platform
• Enterprise Intelligence APIs
• Government Intelligence Portal
• Educational Knowledge Platform
• Autonomous Research Agents
• Real-Time Knowledge Graph Updates
• Multi-modal Evidence Processing

The architectural principles above are expected to remain stable throughout this evolution.

---

# FINAL PRINCIPLE

Architecture exists to make future change easier.

Every new feature should reduce complexity, preserve consistency, and strengthen the platform.

Optimize for the engineering team that will maintain this codebase in 2045—not just the sprint you're working on today.
