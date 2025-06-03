# HabitBaca

A modern reading habit tracker that helps you build and maintain your reading routine through gamification and progress tracking.

## Features

- 📚 Track your book collection and reading progress
- 📊 Visualize your reading statistics and achievements
- 🏆 Earn badges and level up as you read
- 📱 Responsive design for both desktop and mobile
- 🔐 Secure authentication with Google Sign-in
- 🎯 Set and track reading goals

## Tech Stack

- React + TypeScript
- Vite
- Tailwind CSS
- Supabase (Auth, Database)
- Framer Motion
- Lucide Icons

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Supabase account

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/habitbaca.git
   cd habitbaca
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   - Copy `.env.example` to `.env`
   - Fill in your Supabase credentials:
     ```
     VITE_SUPABASE_URL=your_supabase_project_url
     VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
     ```

4. Start the development server:
   ```bash
   npm run dev
   ```

### Development

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build

## Deployment

This project is configured for easy deployment on Vercel:

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Add your environment variables in Vercel's project settings
4. Deploy!

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.
