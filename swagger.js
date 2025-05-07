// In swagger.js
import swaggerJsdoc from "swagger-jsdoc"
import swaggerUi from "swagger-ui-express"
import jwt from "jsonwebtoken"
import express from "express"

const JWT_SECRET = process.env.JWT_SECRET || "your_jwt_secret_key"

const options = {
    // Your existing Swagger options
    definition: {
        openapi: "3.0.0",
        info: {
            title: "API Documentation",
            version: "1.0.0",
            description: "API Documentation with authentication"
        },
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: "http",
                    scheme: "bearer",
                    bearerFormat: "JWT"
                }
            }
        },
        security: [{
            bearerAuth: []
        }]
    },
    apis: ["./routes/*.js"]
}

const specs = swaggerJsdoc(options)

// Login HTML form
const loginHtml = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>API Documentation - Authentication</title>
  <style>
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      background-color: #f5f5f5;
      margin: 0;
      padding: 0;
      display: flex;
      justify-content: center;
      align-items: center;
      height: 100vh;
    }
    .container {
      background-color: white;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
      width: 100%;
      max-width: 400px;
      padding: 2rem;
    }
    h1 {
      color: #333;
      margin-top: 0;
      margin-bottom: 1.5rem;
      text-align: center;
    }
    .tabs {
      display: flex;
      margin-bottom: 1.5rem;
      border-bottom: 1px solid #ddd;
    }
    .tab {
      flex: 1;
      text-align: center;
      padding: 0.75rem;
      cursor: pointer;
      font-weight: 500;
      color: #666;
      transition: all 0.2s ease;
    }
    .tab.active {
      color: #3f51b5;
      border-bottom: 2px solid #3f51b5;
    }
    .form {
      display: none;
    }
    .form.active {
      display: block;
    }
    .form-group {
      margin-bottom: 1rem;
    }
    label {
      display: block;
      margin-bottom: 0.5rem;
      color: #555;
      font-weight: 500;
    }
    input {
      width: 100%;
      padding: 0.75rem;
      font-size: 1rem;
      border: 1px solid #ddd;
      border-radius: 4px;
      box-sizing: border-box;
    }
    input:focus {
      outline: none;
      border-color: #3f51b5;
    }
    button {
      background-color: #3f51b5;
      color: white;
      border: none;
      border-radius: 4px;
      padding: 0.75rem 1rem;
      font-size: 1rem;
      width: 100%;
      cursor: pointer;
      transition: background-color 0.2s ease;
    }
    button:hover {
      background-color: #303f9f;
    }
    .error {
      color: #f44336;
      font-size: 0.875rem;
      margin-top: 0.5rem;
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>API Documentation</h1>
    <div class="tabs">
      <div class="tab active" id="login-tab">Login</div>
      <div class="tab" id="register-tab">Register</div>
    </div>
    
    <form id="login-form" class="form active" action="/auth/login" method="POST">
      <input type="hidden" name="redirect" value="swagger">
      <div class="form-group">
        <label for="login-email">Email</label>
        <input type="email" id="login-email" name="email" required>
      </div>
      <div class="form-group">
        <label for="login-password">Password</label>
        <input type="password" id="login-password" name="password" required>
      </div>
      <button type="submit">Login</button>
    </form>
    
    <form id="register-form" class="form" action="/auth/register" method="POST">
      <input type="hidden" name="redirect" value="swagger">
      <div class="form-group">
        <label for="register-username">Username</label>
        <input type="text" id="register-username" name="username" required>
      </div>
      <div class="form-group">
        <label for="register-email">Email</label>
        <input type="email" id="register-email" name="email" required>
      </div>
      <div class="form-group">
        <label for="register-password">Password</label>
        <input type="password" id="register-password" name="password" required minlength="6">
      </div>
      <button type="submit">Register</button>
    </form>
  </div>
  
  <script>
    document.getElementById('login-tab').addEventListener('click', () => {
      document.getElementById('login-tab').classList.add('active');
      document.getElementById('register-tab').classList.remove('active');
      document.getElementById('login-form').classList.add('active');
      document.getElementById('register-form').classList.remove('active');
    });
    
    document.getElementById('register-tab').addEventListener('click', () => {
      document.getElementById('register-tab').classList.add('active');
      document.getElementById('login-tab').classList.remove('active');
      document.getElementById('register-form').classList.add('active');
      document.getElementById('login-form').classList.remove('active');
    });
  </script>
</body>
</html>
`;

const swaggerSetup = (app) => {
    // Authentication middleware for Swagger
    app.use('/api-docs', (req, res, next) => {
        console.log('Cookies:', req.cookies); // Log cookies for debugging

        const token = req.cookies.token;

        if (!token) {
            console.log('No token in cookie');
            return res.send(loginHtml);
        }

        try {
            // Verify JWT
            const decoded = jwt.verify(token, JWT_SECRET);
            req.user = decoded;
            console.log('User authenticated:', decoded);
            next(); // Proceed to Swagger UI
        } catch (error) {
            console.error('Token verification failed:', error);
            // Clear invalid token
            res.clearCookie('token');
            return res.send(loginHtml);
        }
    });

    // Setup Swagger UI
    app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(specs, {
        explorer: true,
        customCss: ".swagger-ui .topbar { display: none }",
        customSiteTitle: "API Documentation",
    }));
}

export default swaggerSetup;