## Purpose:
### This folder is for reusable helper functions, constants, and general-purpose logic that are not tied to React components or UI.

## What this folder contains
* **apiPaths.js**

Purpose: Centralized API endpoint definitions.
Ensures consistency and avoids hardcoding URLs across the project.

* **axiosInstance.js**

Purpose: Pre-configured instance of Axios.
Handles base URL, headers, and request/response configuration (e.g., authentication tokens).

* **helpers.js**

Purpose: General utility functions.
Examples include formatting data, transforming values, or small reusable logic used across the app.

* **data.js**

Purpose: Static or mock data.
Used for testing, prototyping, or fallback data before backend integration.

* **uploadImage.js**

Purpose: Handles image upload logic.
Typically includes preparing form data and sending requests to upload images.

* **Usage**
Import only what you need.