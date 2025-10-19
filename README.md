# AI Namu Namu 🧑‍🍳

**Your personal culinary muse. Transform ingredients into delicious meals, plan your week, analyze your health, and estimate calories—all powered by modern AI.**

-----

## ✨ Features

AI Namu Namu is a comprehensive kitchen assistant built on SvelteKit, TypeScript, and a powerful streaming API backend. It offers four core modes to streamline your cooking and health journey:

### 1\. Single Recipe Generation 🥘

  * Input any list of ingredients, dietary restrictions (e.g., vegan, keto), and medical notes (e.g., gluten allergy).
  * Receive a **complete recipe**, including title, description, ingredients, and step-by-step instructions.
  * **Ingredient Auto-Complete:** Fuzzy search powered by **Fuse.js** for fast, typo-tolerant ingredient entry.
  * **Cooking Mode:** A clean, distraction-free view for following the recipe step-by-step.
  * **Scheduling:** Easily save the meal to your calendar (`.ics` file download).

### 2\. 7-Day Meal Planner 📅

  * Provide your constraints and ingredients to generate a **full week's worth of meals**.
  * *Requirement:* Requires a minimum of 5 ingredients for comprehensive planning.

### 3\. Health Analysis & Calorie Goal Planner 🏋️

  * **TDEE Calculation:** Input biometric data (gender, age, weight, height, activity) to receive a detailed **Total Daily Energy Expenditure (TDEE)** analysis.
  * **Personalized Plan:** Set a target weight and timeframe to generate a custom, calorie-restricted meal plan tailored to your goal (simulated subscription feature).

### 4\. Calorie Image Analysis 📷

  * Upload a photo of any meal.
  * The AI will analyze the image to provide a detailed **calorie estimate** and a breakdown of the food components.

#### Core Technology Highlights

  * **Real-time Streaming:** Content is generated and streamed to the UI in real-time using API streaming.
  * **User Management:** Secure authentication with **Firebase** (`$lib/firebase/auth`).
  * **Global State Management:** Persistent storage and reactive state using **Svelte Stores** for favorites and dark mode.
  * **Design:** Adaptive UI with **Dark Mode** support.

-----

## 🛠️ Tech Stack

| Category | Technology | Purpose |
| :--- | :--- | :--- |
| **Framework** | **SvelteKit** | Rapid, modern full-stack web development. |
| **Frontend** | **Svelte, TypeScript** | Reactive UI and strong typing for maintainability. |
| **Styling** | **CSS** (Scoped & Global) | Custom, gradient-based theme with dark mode. |
| **API/Backend**| **Node.js API Endpoints** | Handling external API calls (`/api/generate-recipe`, etc.) |
| **Database/Auth**| **Firebase** | User authentication and session management. |
| **Search** | **Fuse.js** | Client-side fuzzy search for fast ingredient auto-complete. |
| **UI/UX** | **Svelte Stores** | Global state for favorites, dark mode, and toasts. |

-----

## 🚀 Getting Started

These instructions will get you a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites

You'll need **Node.js** installed on your machine.

```bash
# Verify Node.js
node -v
# Should be v18+
```

### Installation

1.  **Clone the repository:**

    ```bash
    git clone [YOUR_REPO_URL_HERE]
    cd ai-namu-namu
    ```

2.  **Install dependencies:**

    ```bash
    npm install
    ```

3.  **Set up Environment Variables:**
    Create a file named **`.env`** in the root of your project and add your Firebase and API keys.

    ```
    # --- Firebase Configuration (Client-side) ---
    PUBLIC_FIREBASE_API_KEY="..."
    PUBLIC_FIREBASE_AUTH_DOMAIN="..."
    PUBLIC_FIREBASE_PROJECT_ID="..."
    PUBLIC_FIREBASE_STORAGE_BUCKET="..."
    PUBLIC_FIREBASE_MESSAGING_SENDER_ID="..."
    PUBLIC_FIREBASE_APP_ID="..."
    PUBLIC_FIREBASE_MEASUREMENT_ID="..."

    # --- AI/Gemini API Key (Server-side/API Endpoints) ---
    GEMINI_API_KEY="..."
    ```

    *Note: The API key is used by the server endpoints (`src/routes/api/`) for generating content.*

4.  **Run the development server:**

    ```bash
    npm run dev
    ```

The application will be running locally at `http://localhost:5173`.

-----

## 📦 File Structure Highlights

| Path | Description |
| :--- | :--- |
| `src/routes/+page.svelte` | **The main application logic and UI component.** |
| `src/stores/` | Contains Svelte stores for favorites, dark mode, and toasts. |
| `src/types/commonIngredients.ts` | **Ingredient list** and **Fuse.js setup** for auto-complete. |
| `src/routes/api/` | **API Endpoints** for communicating with the AI model (e.g., `+server.ts` for streaming). |
| `src/lib/` | Reusable components like `MarkdownRenderer`, `Toast`, and forms. |
| `src/lib/firebase/auth.ts` | Firebase Authentication logic. |

-----

## 🤝 Contribution

Contributions are welcome\! If you find a bug or have an idea for an improvement (like expanding the `commonIngredients` list with more items or icons), please **open an issue or submit a pull request**.

-----

## 📝 License

This project is licensed under the **MIT License** - see the `LICENSE` file for details.
