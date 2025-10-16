# Amazon Content Audit Tool

A web application that analyzes Amazon product listings and provides content quality insights based on various criteria including images, title, bullet points, description, and enhanced content.

## Features

- Analyze any Amazon product URL from any country domain
- Extract and count product images
- Analyze product title
- Extract and count bullet points
- Check for product description
- Detect enhanced content (A+ content)
- Responsive UI for desktop and mobile

## Getting Started

### Prerequisites

- Node.js 18.x or later
- npm or yarn

### Installation

1. Clone the repository
2. Install dependencies:

```bash
npm install
# or
yarn install
```

3. Run the development server:

```bash
npm run dev
# or
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the application.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deployment

### Deploy on Vercel

This application is optimized for deployment on Vercel:

1. Push your code to a GitHub repository
2. Import the project in Vercel: https://vercel.com/new
3. Connect your GitHub repository
4. Deploy

No additional configuration is needed as the `vercel.json` file is already set up.

### Important Notes

- Amazon may block requests from serverless functions. For production use, consider using a proxy service or implementing IP rotation.
- Different Amazon domains may have different page structures, which could affect scraping accuracy.
