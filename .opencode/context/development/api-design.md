# API Design Standards

## REST API Principles

### HTTP Methods
- **GET**: Retrieve data (idempotent, no side effects)
- **POST**: Create new resources
- **PUT**: Update entire resource (idempotent)
- **PATCH**: Partial update
- **DELETE**: Remove resource (idempotent)

### URL Structure
```
# ✅ Good - RESTful URLs
GET /api/users
GET /api/users/123
POST /api/users
PUT /api/users/123
DELETE /api/users/123

GET /api/users/123/posts
POST /api/users/123/posts

# ❌ Avoid - Non-RESTful
GET /api/getUsers
POST /api/createUser
POST /api/deleteUser/123
```

### Response Status Codes
- **200 OK**: Successful GET, PUT, PATCH
- **201 Created**: Successful POST
- **204 No Content**: Successful DELETE
- **400 Bad Request**: Invalid request data
- **401 Unauthorized**: Authentication required
- **403 Forbidden**: Access denied
- **404 Not Found**: Resource doesn't exist
- **409 Conflict**: Resource conflict
- **422 Unprocessable Entity**: Validation errors
- **500 Internal Server Error**: Server error

## Request/Response Format

### Request Structure
```json
{
  "data": {
    "name": "John Doe",
    "email": "john@example.com"
  },
  "meta": {
    "requestId": "req-123",
    "timestamp": "2025-12-09T15:30:00Z"
  }
}
```

### Response Structure
```json
{
  "data": {
    "id": 123,
    "name": "John Doe",
    "email": "john@example.com",
    "createdAt": "2025-12-09T15:30:00Z"
  },
  "meta": {
    "requestId": "req-123",
    "timestamp": "2025-12-09T15:30:00Z"
  }
}
```

### Error Response Structure
```json
{
  "error": {
    "code": "VALIDATION_FAILED",
    "message": "Request validation failed",
    "details": [
      {
        "field": "email",
        "code": "INVALID_EMAIL",
        "message": "Email format is invalid"
      }
    ]
  },
  "meta": {
    "requestId": "req-123",
    "timestamp": "2025-12-09T15:30:00Z"
  }
}
```

## Authentication and Authorization

### JWT Token Structure
```json
{
  "sub": "user123",
  "iat": 1609459200,
  "exp": 1609545600,
  "aud": "api.example.com",
  "iss": "auth.example.com",
  "roles": ["user", "admin"]
}
```

### Authorization Headers
```
Authorization: Bearer <jwt-token>
```

## Pagination

### Request Parameters
```
GET /api/users?page=1&limit=20&sort=createdAt&order=desc
```

### Response with Pagination
```json
{
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 150,
    "totalPages": 8,
    "hasNext": true,
    "hasPrev": false
  }
}
```

## Filtering and Searching

```
# Simple filtering
GET /api/users?status=active&role=admin

# Search
GET /api/users?search=john

# Range filtering
GET /api/orders?createdAt[gte]=2025-01-01&createdAt[lte]=2025-12-31

# Include related data
GET /api/users?include=profile,orders
```

## Rate Limiting

### Headers
```
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 999
X-RateLimit-Reset: 1609459200
```

### Response when rate limited
```json
{
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "Rate limit exceeded",
    "retryAfter": 60
  }
}
```

## Versioning

### URL Versioning (Preferred)
```
GET /api/v1/users
GET /api/v2/users
```

### Header Versioning
```
Accept: application/vnd.api+json;version=1
```

## Documentation

- Use OpenAPI/Swagger specification
- Include example requests and responses
- Document all error codes and meanings
- Provide SDKs or code examples
- Keep documentation up to date with changes