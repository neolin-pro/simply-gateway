# Simply Gateway

A lightweight, optimized REST API gateway built on the Hapi framework with standardized configurations and externalized processing for enhanced maintainability, performance, and extensibility.

![Node.js](https://img.shields.io/badge/Node.js-14+-green.svg)
![Hapi](https://img.shields.io/badge/Hapi-v19.2+-blue.svg)
![License](https://img.shields.io/badge/License-MIT-blue.svg)

## 🎯 Overview

Simply Gateway provides a clean, structured approach to building API gateways with:
- **Standardized Configurations**: Centralized and consistent configuration management
- **Externalized Processing**: Loose coupling with pre and post-processing capabilities
- **Built-in Features**: Authentication, authorization, caching, logging, and rate limiting
- **Plugin Architecture**: Modular route handling with Hapi plugins
- **Performance Optimized**: Server-side caching with @hapi/catbox

## ✨ Key Features

- 🔐 **Authentication & Authorization**: Built-in basic auth with scope-based authorization
- 📦 **Server-Side Caching**: Optimized response caching with configurable segments
- 📝 **Structured Logging**: Integrated logging with hapi-pino
- 🔄 **Versioned Routes**: Support for API versioning with sunset capabilities
- 🛡️ **Security**: Admin API localhost-only access, request validation
- 🚀 **Performance**: Pre/post-processing offloading for better throughput
- 📊 **Route Discovery**: Visual route mapping with blipp plugin

## 📁 Project Structure

```
simply-gateway/
│
├── server.js                  # Main application entry point
├── package.json               # Dependencies and scripts
│
├── config/                    # Configuration files
│   ├── globals.js            # Global constants and functions
│   ├── init.js               # Initialization values
│   └── manifest.js           # Plugin manifest
│
├── routes/                    # Public API routes (plugins)
│   └── {resource}_{version}/ # Versioned route modules
│       ├── config.js         # Route configuration
│       ├── schema.js         # Validation schemas
│       ├── index.js          # Route definitions
│       └── controller.js     # Handler implementations
│
├── admin_routes/             # Admin API routes
│   └── {resource}_{version}/ # Admin route modules
│
├── core/                     # Core functionality
│   ├── authentication/       # Auth modules
│   ├── cache_segment/        # Response cache factory
│   └── unavailable_rules/    # Service availability rules
│
└── certs/                    # SSL certificates (if needed)
```

## 🚀 Getting Started

### Prerequisites

- Node.js 14 or higher
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/simply-gateway.git
   cd simply-gateway
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure the gateway**
   - Edit `config/init.js` for server settings
   - Update `config/manifest.js` to include your route plugins
   - Configure authentication in `core/authentication/`

4. **Start the server**
   ```bash
   node server.js
   ```

The server will start and display available routes via the blipp plugin.

## 📦 Dependencies

```json
{
  "@hapi/basic": "^6.0.0",      // Basic authentication
  "@hapi/glue": "^7.0.0",        // Server composition
  "@hapi/hapi": "^19.2.0",       // Core framework
  "blipp": "^4.0.1",              // Route listing
  "hapi-pino": "^8.0.1"           // Logging
}
```

## 🔧 Configuration

### 1. Global Configuration (`config/`)

#### `globals.js`
Define global constants, objects, and utility functions:
```javascript
module.exports = {
  API_VERSION: 'v1',
  TIMEOUT: 30000,
  // ... other globals
};
```

#### `init.js`
Configure initialization values for:
- **Server**: Host, port, TLS settings
- **Loggers**: Logging configuration
- **Authentication**: Auth strategy setup

#### `manifest.js`
Register plugins using Glue manifest:
```javascript
{
  register: {
    plugins: [
      { plugin: './routes/simples_1' },
      { plugin: './routes/simples_2' },
      // ... add new route plugins here
    ]
  }
}
```

### 2. Route Plugins (`routes/`)

Each API route is a self-contained Hapi plugin with the following structure:

#### Directory Naming Convention
```
{resource_name}_{major_version}
Example: simples_1, simples_2
```

#### File Structure

**`config.js`** - Route metadata and lifecycle extensions
```javascript
module.exports = {
  version: 'v1',
  resource: 'simples',
  sunset: '2026-12-31',  // Optional deprecation date
  // Lifecycle extensions
};
```

**`schema.js`** - Request/response validation schemas
```javascript
const Joi = require('joi');

module.exports = {
  params: Joi.object({
    id: Joi.string().required()
  }),
  // ... other schemas
};
```

**`index.js`** - Route definitions
```javascript
module.exports = {
  plugin: {
    name: 'simples_1',
    register: async (server, options) => {
      server.route({
        method: 'GET',
        path: '/api/v1/simples/{id}',
        options: {
          auth: {
            scope: ['GET /api/v1/simples/*']
          },
          cache: {
            expiresIn: 60 * 1000,  // 1 minute
            privacy: 'private'
          }
        },
        handler: require('./controller').getSimple
      });
    }
  }
};
```

**`controller.js`** - Handler implementations
```javascript
exports.getSimple = async (request, h) => {
  const { id } = request.params;
  // Business logic here
  return { id, name: 'John Doe' };
};
```

## 🔐 Authentication & Authorization

### Authentication

Uses `@hapi/basic` authentication plugin with customizable validation:

**Setup** (`core/authentication/auth_validate.js`):
```javascript
exports.validate = async (request, username, password, h) => {
  const credentials = await getCredentials(username, password);
  
  if (!credentials) {
    return { isValid: false };
  }
  
  return {
    isValid: true,
    credentials: {
      id: credentials.id,
      name: credentials.name,
      scope: credentials.scopes  // User's authorization scopes
    }
  };
};
```

### Authorization

Scope-based authorization using Hapi's built-in functionality:

**Scope Format**:
```
{HTTP_METHOD} {resource_URI} [{optional_params}]
```

**Examples**:
- Collection access: `GET /api/v1/simples`
- Instance access: `GET /api/v1/simples/*`
- With representation check: `GET /api/v1/simples/* {params.representation}`
- Subresource access: `GET /api/v1/simples/*/items/*`

**Route Configuration**:
```javascript
{
  auth: {
    scope: ['GET /api/v1/simples/*', 'admin']  // Requires ANY of these scopes
  }
}
```

### Admin Authentication

Admin routes have additional security:
- Localhost-only access enforcement
- Separate authentication validation (`admin_auth_validate.js`)
- Stricter scope requirements

## 💾 Caching Strategy

### Server-Side Caching

Leverages `@hapi/catbox` for response caching:

**Route-Level Cache** (`index.js`):
```javascript
{
  cache: {
    expiresIn: 60 * 1000,      // Cache duration (ms)
    privacy: 'private',         // Cache privacy level
    statuses: [200, 204]        // Cacheable status codes
  }
}
```

**Cache Segments** (`core/cache_segment/`):
Factory pattern for creating cache segments per route plugin.

### Client-Side Caching

- ETag validators for conditional requests
- Cache-Control headers support
- Client-configurable caching options

> **Note**: Server caching can use service provider headers or local configuration for flexibility.

## 📝 Logging

Integrated logging with `hapi-pino`:

- Request/response logging
- Error tracking
- Performance metrics
- Customizable log levels
- Post-processing support for log aggregation

## 🛠️ Advanced Features

### Request Lifecycle Extensions

Create custom extensions in `config.js` of each route plugin:

```javascript
exports.extensions = {
  onPreAuth: async (request, h) => {
    // Pre-authentication logic
    return h.continue;
  },
  onPostAuth: async (request, h) => {
    // Post-authentication logic
    return h.continue;
  }
};
```

### Service Availability Rules

Configure regex patterns to mark services as unavailable:

```javascript
// core/unavailable_rules/
exports.rules = [
  /\/api\/v1\/maintenance\/.*/,
  /\/api\/v1\/deprecated\/.*/
];
```

### Versioning & Deprecation

- Major version in route path: `/api/v1/`, `/api/v2/`
- Sunset header for deprecation notices
- Smooth migration path for clients

## 🔄 Pre & Post Processing

### Pre-Processing

Externalized tasks executed before gateway processing:
- Authentication data loading and refresh
- Rate limiting checks
- Request enrichment

### Post-Processing

Offloaded tasks after response:
- Log aggregation and shipping
- Analytics collection
- Metric generation

**Benefits**:
- ✅ Reduced gateway latency
- ✅ Better separation of concerns
- ✅ Easier scaling and maintenance

## 📊 Monitoring & Debugging

### Route Discovery

The `blipp` plugin displays all routes on startup:
```
GET    /api/v1/simples
GET    /api/v1/simples/{id}
POST   /api/v1/simples
...
```

### Health Checks

Implement health check endpoints in `admin_routes/`:
```javascript
{
  method: 'GET',
  path: '/health',
  handler: (request, h) => {
    return { status: 'healthy', uptime: process.uptime() };
  }
}
```

## 🧪 Testing

```bash
# Run tests
npm test
```

## 🚀 Deployment

### Production Considerations

1. **Environment Variables**: Externalize sensitive config
2. **Process Manager**: Use PM2 or similar for process management
3. **Load Balancing**: Deploy behind nginx or HAProxy
4. **SSL/TLS**: Configure certificates in `certs/` directory
5. **Monitoring**: Integrate with logging and APM solutions

### Docker Deployment

Create a `Dockerfile`:
```dockerfile
FROM node:14-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 3000
CMD ["node", "server.js"]
```

## 🤝 Contributing

Contributions are welcome! Please follow these guidelines:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 👤 Author

**Nay Zaw Lin**
- GitHub: [@neolin-pro](https://github.com/neolin-pro)
- Email: nayzawlin07@gmail.com

## 🙏 Acknowledgments

- [Hapi.js](https://hapi.dev/) - The awesome Node.js framework
- [@hapi/basic](https://hapi.dev/module/basic/) - Authentication plugin
- [hapi-pino](https://github.com/pinojs/hapi-pino) - Fast logging
- The Hapi community for excellent documentation

## 📚 Resources

- [Hapi.js Documentation](https://hapi.dev/)
- [API Gateway Pattern](https://microservices.io/patterns/apigateway.html)
- [REST API Best Practices](https://restfulapi.net/)

## 🐛 Known Issues & Roadmap

- [ ] Add rate limiting implementation
- [ ] JWT authentication support
- [ ] GraphQL gateway support
- [ ] Distributed tracing integration
- [ ] WebSocket support
- [ ] API documentation generator

---

⭐ If you found this project helpful, please consider giving it a star!

**Built with ❤️ using Hapi.js**