# 📊 Invoice Management Dashboard

A modern, full-featured invoice management dashboard built with Next.js 15, TypeScript, Supabase, and Tremor charts. Features dark/light theme support, real-time data visualization, and comprehensive invoice tracking.

## ✨ Features

### 🎨 **Modern UI/UX**
- **Dark/Light Theme Toggle** - Seamless theme switching with persistent preference
- **Responsive Design** - Works perfectly on desktop, tablet, and mobile
- **Smooth Animations** - Hover effects, transitions, and loading states
- **Accessibility** - Screen reader support and keyboard navigation

### 📊 **Data Visualization**
- **Interactive Charts** - Area, Bar, and Donut charts with Tremor
- **KPI Cards** - Real-time statistics with gradient backgrounds
- **Dynamic Colors** - Theme-aware chart colors for optimal visibility
- **Responsive Charts** - Adaptive sizing for all screen sizes

### 🔐 **Authentication & Security**
- **Supabase Auth** - Secure authentication with email/password
- **Protected Routes** - Automatic redirection for unauthorized access
- **Session Management** - Persistent login with refresh tokens

### 📋 **Invoice Management**
- **Real-time Data** - Live invoice data from Supabase
- **Mock Data Fallback** - Graceful degradation when offline
- **Invoice Stats** - Total, paid, pending, and overdue tracking
- **Vendor Analytics** - Top 10 vendors by invoice value

## 🛠 Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Database**: Supabase
- **UI Library**: shadcn/ui + Tailwind CSS
- **Charts**: Tremor React
- **Authentication**: Supabase Auth
- **Theme**: next-themes
- **Icons**: Lucide React

## 📁 Project Structure

```
dashboard/
├── app/                    # Next.js App Router
│   ├── dashboard/         # Protected dashboard pages
│   ├── login/            # Authentication pages
│   ├── signup/           # User registration
│   ├── layout.tsx        # Root layout with theme provider
│   └── globals.css       # Global styles and theme variables
├── components/           # Reusable UI components
│   ├── ui/              # shadcn/ui components
│   ├── Header.tsx       # Navigation header with theme toggle
│   ├── Sidebar.tsx      # Navigation sidebar
│   ├── KPICards.tsx     # Statistics cards
│   ├── InvoiceCharts.tsx # Data visualization charts
│   ├── ThemeToggle.tsx  # Theme switcher component
│   └── theme-provider.tsx # Theme context provider
├── lib/                 # Utility functions and configurations
│   ├── supabase.ts      # Supabase client setup
│   ├── invoiceQueries.ts # Database queries and formatting
│   ├── mockData.ts      # Fallback data for development
│   └── utils.ts         # General utility functions
└── types/              # TypeScript type definitions
    └── invoice.ts      # Invoice-related interfaces
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ and npm
- Supabase account and project
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/WillyHanafi1/dashboard.git
   cd dashboard
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   Create a `.env.local` file in the root directory:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. **Database Setup**
   Run the following SQL in your Supabase SQL editor:
   ```sql
   -- Create invoices table
   CREATE TABLE invoices (
     id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
     vendor_name TEXT NOT NULL,
     amount DECIMAL(10,2) NOT NULL,
     status TEXT CHECK (status IN ('paid', 'pending', 'overdue')) NOT NULL,
     due_date DATE,
     created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
   );
   
   -- Insert sample data
   INSERT INTO invoices (vendor_name, amount, status, due_date) VALUES
   ('PT. Teknologi Maju', 15000000, 'paid', '2024-01-15'),
   ('CV. Digital Solusi', 8500000, 'pending', '2024-02-01'),
   ('PT. Inovasi Global', 12000000, 'paid', '2024-01-30');
   ```

5. **Run the development server**
   ```bash
   npm run dev
   ```

6. **Open in browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🎯 Key Features Breakdown

### 📊 Dashboard Analytics
- **Total Invoices**: Complete count with trend analysis
- **Total Value**: Sum of all invoice amounts with currency formatting
- **Payment Status**: Real-time paid vs pending vs overdue tracking
- **Completion Rate**: Percentage of successfully paid invoices

### 📈 Data Visualization
- **Monthly Trend Chart**: Area chart showing payment trends over time
- **Top Vendors Chart**: Horizontal bar chart of highest-value vendors
- **Payment Status Chart**: Donut chart of payment distribution

### 🎨 Theme System
- **Persistent Preference**: Theme choice saved in localStorage
- **System Detection**: Auto-detect user's OS theme preference
- **Hydration-Safe**: No flash of unstyled content (FOUC)
- **Chart Adaptation**: Dynamic colors for optimal visibility in both themes

## 🔧 Configuration

### Supabase Setup
1. Create a new Supabase project
2. Set up authentication with email/password
3. Create the invoices table using the provided SQL
4. Add your Supabase URL and anon key to `.env.local`

### Theme Customization
The theme system uses CSS variables defined in `globals.css`. You can customize colors by modifying the `:root` and `.dark` selectors.

### Chart Colors
Charts automatically adapt to the current theme. Colors are defined in `InvoiceCharts.tsx` with separate palettes for light and dark modes.

## 📱 Responsive Design

The dashboard is fully responsive with breakpoints for:
- **Mobile** (< 640px): Single column layout, compact navigation
- **Tablet** (640px - 1024px): Two-column grid, collapsible sidebar
- **Desktop** (> 1024px): Full three-column layout, expanded sidebar

## 🔒 Security Features

- **Authentication Required**: All dashboard routes are protected
- **Input Validation**: TypeScript types ensure data integrity
- **SQL Injection Protection**: Supabase provides built-in protection
- **XSS Prevention**: React's built-in XSS protection

## 🚀 Deployment

### Vercel (Recommended)
1. Push your code to GitHub
2. Connect your repository to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy automatically

### Docker
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/) - The React framework for production
- [Supabase](https://supabase.com/) - Open source Firebase alternative
- [Tremor](https://www.tremor.so/) - React components for building dashboards
- [shadcn/ui](https://ui.shadcn.com/) - Beautiful UI components
- [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS framework

## 📞 Support

If you have any questions or need help with setup, please open an issue in the GitHub repository.

---

**Built with ❤️ using Next.js and TypeScript**