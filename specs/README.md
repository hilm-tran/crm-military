# Military Manager - Specification Documentation

Welcome to the Military Manager system specification. This folder contains comprehensive documentation for all aspects of the frontend application.

---

## 📋 Specification Files

### 1. **[SYSTEM_SPEC.md](./SYSTEM_SPEC.md)** - System Overview & Architecture

- System overview and key features
- Overall architecture and tech stack
- Complete module specifications
- All pages and routes
- Data models and interfaces
- User roles & permissions matrix
- Business workflows with diagrams
- Component requirements
- State management approach
- Error handling strategy
- Security considerations

**Best for**: Understanding the big picture, high-level design, architectural decisions

---

### 2. **[API_SPEC.md](./API_SPEC.md)** - API Integration Details

- Base API client configuration
- Request/response format standards
- All 50+ API endpoints documented with:
  - Purpose & description
  - Request parameters
  - Response format (TypeScript types)
  - Frontend usage examples
- Error response examples
- Rate limiting & CORS configuration
- Authentication flow
- Data validation rules

**Best for**: API integration, debugging API calls, understanding data contracts

---

### 3. **[COMPONENT_UI_SPEC.md](./COMPONENT_UI_SPEC.md)** - UI & Component Guidelines

- Complete component architecture & hierarchy
- Layout components (Header, Sidebar, Layout)
- All page component specifications
- Detailed mockups and layouts for each page
- Reusable component patterns
- Form patterns with react-hook-form
- Styling guidelines & color scheme
- Responsive design breakpoints
- Accessibility requirements
- Keyboard navigation

**Best for**: UI implementation, component design, styling decisions, responsive layouts

---

## 🎯 Quick Navigation

### For Backend Integration

→ Start with [API_SPEC.md](./API_SPEC.md)

- Review all endpoint signatures
- Understand request/response formats
- Check validation rules

### For Frontend Development

→ Start with [SYSTEM_SPEC.md](./SYSTEM_SPEC.md), then [COMPONENT_UI_SPEC.md](./COMPONENT_UI_SPEC.md)

- Understand module responsibilities
- Review component hierarchy
- Follow component patterns
- Implement with provided mockups

### For QA/Testing

→ Review all three specs

- System workflows from [SYSTEM_SPEC.md](./SYSTEM_SPEC.md)
- API test cases from [API_SPEC.md](./API_SPEC.md)
- UI acceptance criteria from [COMPONENT_UI_SPEC.md](./COMPONENT_UI_SPEC.md)

### For Project Management

→ [SYSTEM_SPEC.md](./SYSTEM_SPEC.md) - Features & Modules section

---

## 📦 Project Structure

```
military-fe/
├── specs/
│   ├── README.md                    (this file)
│   ├── SYSTEM_SPEC.md              (✅ System architecture)
│   ├── API_SPEC.md                 (✅ API endpoints)
│   └── COMPONENT_UI_SPEC.md        (✅ Components & UI)
│
├── app/
│   ├── (public)/login/
│   ├── (private)/
│   │   ├── dashboard/
│   │   ├── soldiers/
│   │   ├── add-soldier/
│   │   ├── history/
│   │   └── requests/
│   └── layout.tsx
│
├── components/
│   ├── Header.tsx
│   ├── Sidebar.tsx
│   ├── SoldierTable.tsx
│   ├── AddSoldierModal.tsx
│   ├── ImageUpload.tsx
│   └── ...
│
├── hooks/
│   ├── use-auth.ts
│   ├── use-soldier.ts
│   ├── use-region.ts
│   ├── use-unit.ts
│   ├── use-submission.ts
│   ├── use-leave-request.ts
│   ├── use-leave-approval-config.ts
│   ├── use-qr-scan.ts
│   ├── use-combobox.ts
│   └── use-debounce.ts
│
├── lib/
│   ├── api-client.ts
│   └── routes/
│
├── types/
│   ├── global.type.ts
│   ├── global.enum.ts
│   └── index.ts
│
└── package.json
```

---

## 🚀 Key Features

### Personnel Management

- ✅ CRUD operations for military personnel
- ✅ Auto-generated QR codes
- ✅ Image upload to S3
- ✅ Search & pagination
- ✅ Role-based access control

### Leave Request Workflow

- ✅ Multi-level approval process
- ✅ Round-based tracking (1.0001, 1.0002, 2.0001, etc.)
- ✅ Return & amendment support
- ✅ Approval history timeline
- ✅ Permission validation

### QR Gate Access Control

- ✅ Automatic permission validation
- ✅ Real-time exit count tracking
- ✅ Civilian manual approval workflow
- ✅ Scan log audit trail

### Organization Management

- ✅ Region & unit hierarchy
- ✅ Logo uploads
- ✅ Combobox data for forms

---

## 📊 Module Responsibilities

| Module            | Purpose            | Hooks                       | Pages                       |
| ----------------- | ------------------ | --------------------------- | --------------------------- |
| **Auth**          | Login/logout       | `use-auth`                  | `/login`                    |
| **Personnel**     | CRUD soldiers      | `use-soldier`               | `/soldiers`, `/add-soldier` |
| **Organization**  | Regions & units    | `use-region`, `use-unit`    | -                           |
| **Submission**    | Approval workflows | `use-submission`            | -                           |
| **Leave Request** | Leave management   | `use-leave-request`         | `/requests`                 |
| **Leave Config**  | Approval rules     | `use-leave-approval-config` | -                           |
| **QR Scan**       | Gate control       | `use-qr-scan`               | `/history`                  |
| **Combobox**      | Dropdown data      | `use-combobox`              | -                           |

---

## 🔒 Security Checklist

- ✅ JWT authentication with Bearer tokens
- ✅ Session persistence in HTTP-only cookies
- ✅ Role-based access control
- ✅ Scope-based data filtering
- ⚠️ TODO: Token expiration & refresh strategy
- ⚠️ TODO: Rate limiting implementation
- ⚠️ TODO: CORS configuration
- ⚠️ TODO: Input sanitization

---

## 🐛 Known Issues & TODOs

### High Priority 🔴

- [ ] Configure JWT token expiration
- [ ] Implement token refresh mechanism
- [ ] Add rate limiting on auth endpoints
- [ ] Configure CORS properly
- [ ] Add API error code mapping

### Medium Priority 🟠

- [ ] Implement permission check API for leave approval
- [ ] Add audit logging for sensitive operations
- [ ] Add loading skeletons
- [ ] Optimize image lazy-loading
- [ ] Add role-based UI rendering

### Low Priority 🟡

- [ ] Advanced search filters
- [ ] Dark mode support
- [ ] Internationalization
- [ ] Export reports (PDF/Excel)

---

## 🧪 Testing Coverage

### Unit Tests

- Custom hooks (all 9 hooks)
- Form validation
- Utility functions

### Integration Tests

- Page navigation flows
- Form submission workflows
- API integration

### E2E Tests

- Complete user journeys:
  - Login → Create leave → Approve → Exit gate
  - Personnel management workflows

---

## 📚 Tech Stack

```
Frontend Framework:   Next.js 14 (App Router)
UI Library:           HeroUI + Tailwind CSS
Form Handling:        react-hook-form
HTTP Client:          Custom apiClient with JWT
Icons:                Iconify
QR Codes:             qrcode library
State Management:     React Hooks (useCallback, useMemo)
```

---

## 🔄 Development Workflow

### 1. Setup

```bash
npm install
export NEXT_PUBLIC_BASE_API=https://api.your-domain.com
npm run dev
```

### 2. Start implementing a feature

- Review specs: Pick relevant spec file(s)
- Create components following patterns
- Use hooks for API integration
- Test with mock data first

### 3. Integration

- Connect to actual API endpoints
- Test error scenarios
- Verify permission validation
- Test with actual JWT tokens

### 4. QA

- Test all user workflows
- Verify responsive design
- Check accessibility
- Performance testing

---

## 📖 Reading Guide by Role

### Frontend Developer

1. Start: [SYSTEM_SPEC.md](./SYSTEM_SPEC.md) - Module Specifications
2. Then: [COMPONENT_UI_SPEC.md](./COMPONENT_UI_SPEC.md) - Component patterns
3. Reference: [API_SPEC.md](./API_SPEC.md) - API integration

### Backend Developer

1. Start: [API_SPEC.md](./API_SPEC.md) - All endpoints
2. Reference: [SYSTEM_SPEC.md](./SYSTEM_SPEC.md) - Data models

### QA Engineer

1. Read: [SYSTEM_SPEC.md](./SYSTEM_SPEC.md) - Business workflows
2. Review: [API_SPEC.md](./API_SPEC.md) - Test scenarios
3. Check: [COMPONENT_UI_SPEC.md](./COMPONENT_UI_SPEC.md) - UI acceptance criteria

### Project Manager

1. Focus: [SYSTEM_SPEC.md](./SYSTEM_SPEC.md) - Features & Architecture
2. Track: Known Issues & TODOs section

---

## 🤝 Contributing

When updating specs:

1. Keep them synchronized across all files
2. Update version/date at the top
3. Cross-reference between documents
4. Include examples and code snippets
5. Mark incomplete items as ⚠️ TODO

---

## 📞 Questions or Issues?

For specification clarifications:

- Review the relevant spec document
- Check the Business Workflows section
- Look for similar examples in the same document

For development issues:

- Refer to the specific module section
- Check API endpoint details
- Review component patterns and examples

---

**Last Updated**: 2026-04-21  
**Version**: 1.0  
**Status**: In Development
