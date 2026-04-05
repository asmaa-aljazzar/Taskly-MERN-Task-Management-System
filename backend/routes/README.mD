# routes/ Folder – What It’s For
## In the backend of a MERN application,
* the routes folder contains all the API endpoint definitions – the URLs that the frontend (or any client) talks to. Each file in this folder describes what should happen when a specific URL is called (e.g., GET /api/users or POST /api/orders).

## Why we use a dedicated folder for routes
* Organization – Keeps the server code tidy. Instead of writing all routes inside one big file, each group of related endpoints lives in its own file (e.g., userRoutes.js, productRoutes.js).

* Maintainability – When you need to add or change an API feature, you know exactly where to look. This makes updates faster and safer.

* Separation of concerns – Routes only handle which URL triggers which action. The actual business logic is kept in separate controllers/ files. This makes the code easier to test and reuse.

* Scalability – As the project grows, you simply add new route files without cluttering the main server file.

