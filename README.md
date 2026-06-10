# QuickMech - Mechanic Near You

A modern React application connecting users to mechanics fast. This full-featured platform provides a complete user experience from login to service booking and referral rewards.

## 🌟 Features

### 1. **Login & Authentication**
   - Clean two-section layout with branding and messaging
   - Username and mobile number input
   - OTP-based authentication flow
   - Responsive design for all devices

### 2. **OTP Verification**
   - 6-digit OTP input with auto-focus
   - Real-time validation
   - Resend OTP option
   - Professional card-based UI

### 3. **Dashboard**
   - Browse mechanics near your location
   - Mechanic profiles with ratings and reviews
   - Service listings for each mechanic
   - Quick action buttons for tracking and payments
   - Responsive grid layout

### 4. **Referral Program**
   - Share unique referral code
   - Track referrals and earnings
   - View referral history
   - Earn ₹200 per successful referral
   - One-click copy referral code

## 📁 Project Structure

```
QuickMech/
├── public/
│   └── index.html
├── src/
│   ├── pages/
│   │   ├── Login.js & Login.css
│   │   ├── OTPVerification.js & OTPVerification.css
│   │   ├── Dashboard.js & Dashboard.css
│   │   └── Referral.js & Referral.css
│   ├── App.js & App.css
│   ├── index.js & index.css
│   └── index.js
├── package.json
├── .gitignore
└── README.md
```

## 🚀 Getting Started

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn

### Installation

1. **Navigate to project directory**
   ```bash
   cd /Users/Ajay badhe/Desktop/QuickMech
   ```

2. **Install dependencies** (if not already installed)
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm start
   ```

4. **Open in browser**
   - The app will automatically open at `http://localhost:3000`

## 🎨 UI/UX Highlights

- **Modern Design**: Clean, professional interface with gradient backgrounds
- **Smooth Animations**: Transitions and hover effects throughout
- **Responsive Layout**: Works perfectly on desktop, tablet, and mobile
- **Intuitive Navigation**: Easy flow between pages
- **Color Scheme**: 
  - Primary: Purple gradient (#667eea to #764ba2)
  - Secondary: Dark text on light backgrounds
  - Accents: Green for success, Yellow for pending

## 📱 Pages & Navigation Flow

```
Login Page
    ↓
OTP Verification
    ↓
Dashboard (Home)
    ├→ Referral Program
    └→ Track Mechanic / Payment History / Ratings
```

## 🔄 User Flow

1. **Login**: Enter username and mobile number → Click "Get OTP"
2. **Verify**: Enter 6-digit OTP → System verifies
3. **Dashboard**: View available mechanics near you
4. **Referral**: Share code and earn rewards
5. **Logout**: Return to login page

## 🛠 Technologies Used

- **React 18**: Frontend framework
- **CSS3**: Styling with Flexbox and Grid
- **React Hooks**: State management (useState)
- **Responsive Design**: Mobile-first approach

## 📈 Features to Add (Future)

- Backend API integration
- Real-time location tracking
- Payment gateway integration
- Live chat support
- Service history
- Advanced search & filters
- Push notifications
- Machine learning for mechanic recommendations

## 🎯 Development Commands

- `npm start` - Start development server
- `npm build` - Create production build
- `npm test` - Run tests
- `npm eject` - Eject from Create React App (irreversible)

## 📄 Component Details

### Login Component
- Two-section split layout
- Responsive form with validation
- OTP request functionality
- Mobile number formatting ready

### OTPVerification Component
- Six-digit OTP input fields
- Auto-focus navigation between inputs
- Disabled submit until OTP complete
- Resend functionality

### Dashboard Component
- Mechanic cards with ratings
- Service tags for quick scanning
- Availability status display
- Quick action buttons for different features
- Welcome message with user name

### Referral Component
- Unique referral code display
- Copy-to-clipboard functionality
- Referral statistics cards
- How-it-works section with 4 steps
- Referral history table
- CTA button for sharing

## 💡 Tips

- Modify colors in CSS files to match your brand
- Update mechanic data in Dashboard.js for dynamic content
- Add API endpoints in components for real backend
- Customize referral rewards in Referral.js
- Add images and real backgrounds to enhance visuals

## 📞 Support

For issues or questions about the application, check the component files for inline comments and documentation.

---

**Built with ❤️ using React**
