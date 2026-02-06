# vue-admin-dashboard
A real-world inspired Vue 3 admin dashboard for order and customer management.

# Vue 3 Admin Dashboard – Order & Customer Management

A professional, real-world inspired **Admin Dashboard** built with **Vue 3** and **TypeScript**.  
This project simulates an internal management panel for an **e-commerce / logistics** company.

The main focus is on:
- Clean architecture
- Scalable folder structure
- Reusable components
- Realistic business scenarios

---

## Tech Stack

- Vue 3 (Composition API)
- TypeScript
- Vite
- Pinia (State Management)
- Vue Router
- Element Plus UI
- Chart.js
- Vue I18n (EN / TR)
- Mock API Services

---

## Features

### Authentication & Authorization
- Login system (mocked)
- Role-based access control (Admin / Operator)
- Route guards

### Dashboard
- Summary cards (total orders, revenue)
- Orders grouped by status chart
- Latest orders table

### Order Management
- Order list with pagination, sorting and filtering
- Order status management using enums
- Status badges with dynamic colors
- Order detail dialog

### Customer Management
- Customer listing
- Active / Passive status
- Customer detail view

### Application Settings
- Dark / Light mode
- Language switch (EN / TR)

---

## Project Structure

```txt
src/
 ├─ api/            # API & mock services
 ├─ components/     # Reusable UI components
 ├─ enums/          # Enums and UI mappings
 ├─ layouts/        # Layout components
 ├─ modules/        # Feature-based modules
 ├─ router/         # Routing & guards
 ├─ stores/         # Pinia stores
 ├─ types/          # TypeScript interfaces
 └─ i18n/           # Localization files
