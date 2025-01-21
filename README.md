# Company Insights AI

## Overview

The **Company Insights AI** is a simple tool designed to provide job applicants with insights about companies. It helps them to quickly gather essential information about potential employers.

## Technologies Used

- **Node.js**: Backend server
- **Express**: Web framework for Node.js
- **TypeScript**: Type-safe JavaScript
- **OpenAI API**: AI-powered insights

## Getting Started

To start using the Company Research Assistant, follow these steps:

### Prerequisites

- **Node.js**: Ensure you have Node.js installed on your machine. You can download it from [nodejs.org](https://nodejs.org/).
- **npm**: Node.js comes with npm, which you'll use to install dependencies.
- **OpenAI API Key**: Obtain an API key from OpenAI and add it to your environment variables.

### Installation

1. **Clone the Repository**:

   ```bash
   git clone https://github.com/aamirsaleem67/company-insights-ai.git
   cd company-insights-ai
   ```

2. **Install Dependencies**:

   ```bash
   npm install
   ```

3. **Set Up Environment Variables**:
   - Create a `.env` file in the root directory.
   - Add your OpenAI API key to the `.env` file:
     ```
     OPENAI_API_KEY=your_openai_api_key_here
     ```

### Running the Application

- **Development Mode**:

  ```bash
  npm run dev
  ```

### Accessing the Application

- Once the server is running, you can access the application by navigating to `http://localhost:3000` in your web browser.

### Customization

- **Modify Prompts**: Feel free to modify the prompts used in the application to better suit your needs and gather the specific insights you are interested in.
