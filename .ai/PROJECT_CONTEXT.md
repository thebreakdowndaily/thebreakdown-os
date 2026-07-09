# PROJECT_CONTEXT.md

# THE BREAKDOWN OS

Version: 1.0

Status: Living Document

Owner: The Breakdown

Last Updated: 2026

---

# Executive Summary

The Breakdown is an evidence-first Knowledge Operating System.

It is not designed to maximize engagement, clicks, or page views.

Its purpose is to transform fragmented information into structured, verifiable, interconnected knowledge.

The platform combines journalism, structured data, knowledge graphs, search, AI, research tools, and evidence verification into one coherent system.

Every engineering decision should reinforce long-term trust rather than short-term engagement.

---

# Mission

Transform information into understanding.

---

# Vision

Become the world's most trusted intelligence platform.

A platform where readers, journalists, researchers, governments, universities, students, and AI systems can discover verified knowledge instead of consuming isolated news articles.

The Breakdown should become for public intelligence what GitHub became for software development.

---

# Core Principles

Every feature must improve one or more of:

- Trust
- Verification
- Context
- Evidence
- Understanding
- Accessibility
- Long-term value

Avoid building features that exist solely to increase engagement metrics.

---

# What The Breakdown Is

The Breakdown is:

- Knowledge Operating System
- Intelligence Platform
- Research Platform
- Evidence Platform
- Knowledge Graph
- Structured Publishing Platform
- Educational Resource
- Search Platform

---

# What The Breakdown Is NOT

It is NOT:

- News website
- Blog
- Magazine
- Opinion platform
- Social network
- Click-driven publisher
- Content farm

---

# Target Users

Primary Users

- Researchers
- Journalists
- Students
- Policy Analysts
- Civil Service Aspirants
- Universities
- Think Tanks
- Government Officials

Secondary Users

- General readers
- Teachers
- NGOs
- Businesses
- AI systems consuming structured data

Enterprise Users

- Government
- Universities
- Newsrooms
- Research organizations
- Companies requiring intelligence APIs

---

# User Problems

Current news products suffer from:

- No context
- Poor verification
- Information overload
- Duplicate reporting
- Missing relationships
- Weak search
- Short content lifespan
- Lack of evidence transparency

The Breakdown solves these problems through structured knowledge.

---

# Product Philosophy

Every story is a knowledge object.

Every topic is interconnected.

Every entity has relationships.

Every claim has evidence.

Every recommendation has sources.

Every timeline preserves historical context.

Knowledge is accumulated rather than forgotten.

---

# Product Components

Homepage

Story Pages

Topic Pages

Entity Pages

Timeline Pages

Knowledge Graph

Research Workspace

CMS

Editorial AI

Reader AI

Search

Analytics

REST API

Future GraphQL Gateway (evaluation only)

---

# Current Architecture

Frontend

- Next.js 15
- React 19
- TypeScript
- Tailwind CSS

Backend

- Supabase
- PostgreSQL

Infrastructure

- Vercel
- Cloudflare

Repository

- GitLab

Patterns

- Service Layer
- Repository Pattern
- Canonical Types
- Plugin Analytics
- Event Bus
- Knowledge Graph
- View Models

---

# Canonical Source of Truth

types/canonical.ts

Everything should reference canonical types.

Never duplicate domain models.

---

# Data Model

Story

Topic

Entity

Timeline

Dataset

Media

Author

Fix

Evidence

Source

Relationship

Graph

Search

User

Analytics

These are represented by canonical types.

---

# Current Repository Status

Current State

- Service Layer complete
- Canonical Types implemented
- Knowledge Graph v2 active
- REST API v1 complete
- AI Layer complete
- CMS operational
- Research Workspace implemented
- Plugin Analytics Architecture implemented

Engineering

- TypeScript strict
- ESLint clean
- Build clean
- Modular design system
- Component modernization in progress

---

# Current Technical Debt

High Priority

- Large renderer components
- Large data-layer store
- Remaining accessibility improvements
- Bundle optimization
- Performance measurement automation

Medium Priority

- Additional tests
- Visual regression
- Lighthouse CI
- Storybook

Low Priority

- Documentation expansion
- Developer tooling

---

# Long-Term Architecture Goals

Single source of truth

No duplicate types

Composable components

Modular services

Plugin-based integrations

Scalable knowledge graph

Semantic search

Observability

AI-first editorial tooling

Enterprise APIs

---

# Product Roadmap

Phase 1

Foundation

✔ Complete

Phase 2

Design System

✔ Complete

Phase 3

Knowledge Platform

✔ Complete

Phase 4

Research Workspace

✔ Complete

Phase 5

AI Platform

✔ Complete

Phase 6

Engineering Excellence

In Progress

Phase 7

Observability

Planned

Phase 8

Enterprise Platform

Planned

Phase 9

Knowledge Intelligence

Planned

Phase 10

Global Platform

Future

---

# Success Metrics

Engineering

0 TypeScript errors

0 ESLint errors

100% build success

Accessible UI

Fast builds

Small bundles

Product

Knowledge objects

Evidence coverage

Search quality

Reader retention

Editorial efficiency

API adoption

Enterprise customers

---

# Decision Framework

When making engineering decisions ask:

Does this improve understanding?

Does this reduce technical debt?

Does this improve trust?

Does this preserve architecture?

Does this increase maintainability?

Does this make future development easier?

If not,

do not implement it.

---

# Constraints

Never:

Rewrite architecture

Replace service layer

Duplicate types

Break APIs

Break routes

Remove accessibility

Reduce SEO

Delete files without dependency analysis

Introduce unnecessary complexity

---

# AI Instructions

Before modifying code:

Read this document.

Understand the product.

Understand the architecture.

Understand the mission.

If uncertain,

stop and ask questions.

Do not guess.

---

# Future Vision (2030–2045)

The Breakdown should evolve into:

- Global Knowledge Graph
- Policy Intelligence Platform
- Scientific Knowledge Explorer
- Public Data Platform
- AI Research Assistant
- Educational Infrastructure
- Enterprise Intelligence Platform
- Government Decision Support Platform

The platform should remain understandable, maintainable, and extensible for decades.

Every engineering decision should move the project toward that future.
