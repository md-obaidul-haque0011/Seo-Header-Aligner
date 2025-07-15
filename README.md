# SEO Header Aligner

This is a professional, AI-powered web tool designed to help users analyze and optimize the heading structure (H1-H6) of their web pages for improved SEO. The application is built with Next.js, React, ShadCN UI, Tailwind CSS, and uses Genkit for its AI capabilities.

## Features

-   **Analyze from URL or HTML:** Users can either provide a live URL to fetch and analyze a webpage's content or paste raw HTML directly.
-   **AI-Powered SEO Analysis:** Leverages Google's Gemini model via Genkit to perform a comprehensive analysis of the header structure, which includes:
    -   An overall **SEO Score** (0-100).
    -   A list of all **detected headers** (H1-H6).
    -   Identification of **structural issues** (e.g., multiple H1s, incorrect hierarchy) with severity levels (Critical, Warning, Info).
    -   Actionable **recommendations** to fix the identified issues.
    -   An **AI-optimized version** of the HTML with an improved header structure.
-   **Ranking Potential Estimator:** A second AI-powered tool that estimates how well a specific header is likely to rank for a target keyword. The report includes:
    -   A **ranking potential score** and category.
    -   A detailed **analysis report** in Markdown.
    -   A list of relevant **keyword variations**.
    -   An **audit checklist** assessing the header against SEO best practices.
-   **Modern, Responsive UI:** Built with ShadCN UI components and Tailwind CSS for a clean, professional, and mobile-friendly user experience.

## Tech Stack

-   **Framework:** [Next.js](https://nextjs.org/) (with App Router)
-   **AI Integration:** [Genkit](https://firebase.google.com/docs/genkit)
-   **UI:** [React](https://react.dev/), [ShadCN UI](https://ui.shadcn.com/), [Tailwind CSS](https://tailwindcss.com/)
-   **Language:** [TypeScript](https://www.typescriptlang.org/)
-   **Form Management:** [React Hook Form](https://react-hook-form.com/) with [Zod](https://zod.dev/) for validation

## Getting Started

Follow these instructions to set up and run the project locally for development.

### Prerequisites

-   [Node.js](https://nodejs.org/en) (version 20 or later recommended)
-   An active Google AI API key. You can get one from [Google AI Studio](https://aistudio.google.com/app/apikey).

### 1. Installation

First, clone the repository and install the necessary dependencies.

```bash
git clone <repository_url>
cd <project_directory>
npm install
```

### 2. Environment Variables

This project uses Genkit to connect to Google's AI models, which requires an API key.

1.  Create a new file named `.env` in the root of your project directory.
2.  Add your Google AI API key to this file:

    ```env
    # .env
    GOOGLE_API_KEY=your_google_ai_api_key_here
    ```

    The application is already configured to load this variable.

### 3. Running the Development Servers

This project requires two separate development servers to be running at the same time: one for the Next.js frontend and one for the Genkit AI flows.

#### A) Start the Genkit Backend Server

The Genkit server runs your AI flows locally, allowing the Next.js app to communicate with them.

Open a terminal and run the following command:

```bash
npm run genkit:dev
```

This will start the Genkit development server, typically on port 4000, and will show the flows that are running.

> **Note:** For automatic reloading when you change an AI flow file, you can use `npm run genkit:watch`.

#### B) Start the Next.js Frontend Server

In a **second, separate terminal**, run the following command to start the Next.js application:

```bash
npm run dev
```

This will start the frontend development server, typically on **port 9002**.

You can now open your browser and navigate to `http://localhost:9002` to see the application in action.

## Project Structure

-   `src/app/`: Contains the main pages and server actions for the Next.js application.
-   `src/components/`: Contains all the React components, including UI components from ShadCN and custom application components like `seo-header-aligner.tsx`.
-   `src/ai/`: This directory holds all the Genkit-related code.
    -   `src/ai/flows/`: Contains the core AI logic, defining the prompts and flows that interact with the Gemini model.
    -   `src/ai/schemas/`: Contains the Zod schemas that define the input and output structures for the AI flows.
    -   `src/ai/genkit.ts`: Configures the main Genkit instance and plugins.
-   `public/`: Static assets for the application.
-   `tailwind.config.ts`: Configuration file for Tailwind CSS.
