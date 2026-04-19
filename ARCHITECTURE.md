// ARCHITECTURE.md
# Professional Architecture Documentation

## Project Structure

### `/app`
Next.js App Router pages and layouts
- `api/` - API routes following REST conventions
- `dashboard/` - Protected dashboard pages
- `login/`, `register/`, `forgot-password/` - Auth pages
- `subjects/` - Course content pages
- `layout.tsx` - Root layout
- `page.tsx` - Landing page

### `/services`
Business logic layer (service classes)
- `auth.service.ts` - Authentication logic
- `profile.service.ts` - User profile management
- `index.ts` - Service exports

### `/hooks`
Custom React hooks for data fetching and state management
- `useAuth.ts` - Authentication hook
- `useProfile.ts` - Profile hook

### `/lib`
Utility functions and helpers
- `/api` - API utilities
  - `response.ts` - Standardized response formatting
  - `errors.ts` - Custom error classes
  - `middleware.ts` - API middleware functions
- `/supabase` - Supabase client initialization
- `monitoring.ts` - Performance monitoring
- `utils.ts` - General utilities

### `/schemas`
Zod validation schemas
- `auth.schema.ts` - Authentication input validation

### `/constants`
Application-wide constants
- `app.ts` - App configuration and constants

### `/components`
Reusable React components
- `/landing` - Landing page components

### `/types`
TypeScript type definitions
- `database.types.ts` - Supabase generated types

### `/supabase`
Database migrations and seeds
- `migration.sql` - Database schema
- `seed.sql` - Seed data

---

## Design Patterns

### 1. Service Layer Pattern
Business logic is encapsulated in service classes (`/services`)
- Separates concerns from React components
- Makes testing easier
- Enables code reuse across pages

Example:
```typescript
const user = await authService.login(credentials)
```

### 2. Custom Hooks Pattern
React-specific logic in hooks (`/hooks`)
- Manages state synchronization
- Handles side effects
- Clean component code

Example:
```typescript
const { user, loading } = useAuth()
```

### 3. Standardized Error Handling
Custom error classes (`/lib/api/errors.ts`)
- Consistent error codes
- Automatic HTTP status mapping
- Error details tracking

Example:
```typescript
throw new ValidationError('Invalid email')
```

### 4. API Response Standardization
All API responses follow consistent format (`/lib/api/response.ts`)
```json
{
  "success": true,
  "data": {...},
  "meta": {
    "timestamp": "2026-04-10T...",
    "version": "1.0"
  }
}
```

### 5. Schema Validation
Zod schemas for input validation (`/schemas`)
- Type-safe validation
- Detailed error messages
- TypeScript type inference

---

## API Conventions

### Response Format
```typescript
// Success
{ success: true, data: {...}, meta: {...} }

// Error
{ success: false, error: { code: "ERROR_CODE", message: "..." }, meta: {...} }
```

### HTTP Status Codes
- `200` - OK
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `409` - Conflict
- `500` - Internal Server Error

### Error Codes
- `VALIDATION_ERROR` - Input validation failed
- `UNAUTHORIZED` - Authentication required
- `FORBIDDEN` - Access denied
- `NOT_FOUND` - Resource not found
- `INTERNAL_SERVER_ERROR` - Server error

---

## Database Layer

Uses Supabase PostgreSQL with:
- Row-level security (RLS)
- Real-time subscriptions
- Built-in authentication

Service classes handle all DB queries:
```typescript
const { data } = await supabase
  .from('table')
  .select('*')
  .eq('id', id)
```

---

## Security Best Practices

1. **Authentication**
   - Supabase Auth with JWT tokens
   - Middleware protection on routes
   - Session management

2. **Authorization**
   - Role-based access control (RBAC)
   - Route protection with middleware
   - API endpoint authorization checks

3. **Input Validation**
   - Zod schemas on all inputs
   - Server-side validation
   - SQL injection prevention via Supabase

4. **Environment Security**
   - Secrets in `.env.local`
   - Public keys in `NEXT_PUBLIC_*` only
   - No credentials in code

---

## Scaling Considerations

### For Growth:
1. **Database** - Supabase handles horizontal scaling
2. **Caching** - Redis layer for frequently accessed data
3. **API Rate Limiting** - Implement in middleware
4. **Monitoring** - Enhanced logging and tracing
5. **CDN** - Static asset distribution
6. **Load Balancing** - With reverse proxy (Nginx)

### Performance:
- Image optimization (already enabled)
- Database query optimization
- Implement pagination
- Asset caching strategies
- Code splitting

---

## Development Workflow

### Adding a New Feature

1. **Create Zod schema** in `/schemas`
   ```typescript
   export const featureSchema = z.object({...})
   ```

2. **Create service** in `/services`
   ```typescript
   class FeatureService { async method() {...} }
   ```

3. **Create hook** in `/hooks` (if needed)
   ```typescript
   export function useFeature() {...}
   ```

4. **Create API route** in `/app/api`
   ```typescript
   export async function POST(req: NextRequest) {...}
   ```

5. **Use in components**
   ```typescript
   const { data } = useFeature()
   ```

---

## Testing Strategy

### Unit Tests
- Services - business logic
- Utilities - helper functions

### Integration Tests
- API endpoints
- Service methods with DB

### E2E Tests
- User workflows
- Authentication flows
- Critical user paths

---

## Deployment

### Production Build
```bash
npm run build
npm start
```

### Docker Deployment
```bash
docker compose up -d
```

### Vercel/Cloud Deployment
```bash
Push to GitHub → Auto-deploy
```

See `PRODUCTION_DEPLOYMENT.md` for detailed setup.

---

## Updating Dependencies

```bash
npm update
npm audit fix
npm run build
```

Always test after updates.

---

## Common Commands

```bash
# Development
npm run dev

# Build
npm run build

# Production
npm start

# Lint check
npm run lint

# Type check (via build)
npm run build
```

---

This architecture follows enterprise best practices while remaining flexible for your project's needs.
