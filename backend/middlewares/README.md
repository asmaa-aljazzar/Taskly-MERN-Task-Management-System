### Middleware

The **middleware** folder contains functions that run **between the client request and the server response**.

These functions intercept requests before they reach the main route logic. They are commonly used to handle tasks that should occur **for many routes**, such as:

* **Authentication** – verifying that the user is logged in.
* **Authorization** – checking if the user has permission to perform an action (e.g., HR, manager).
* **Validation** – ensuring request data is correct before processing.
* **Logging or error handling** – tracking requests or managing unexpected errors.

By placing this logic in middleware, the system keeps the **route handlers clean and focused on business logic**, while shared behaviors are reused across multiple parts of the application.
