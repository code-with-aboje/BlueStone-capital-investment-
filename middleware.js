// middleware.js - Route protection middleware (add to root)

const protectedRoutes = {
  '/dashboard': 'invest.html',
  '/dashboard.html': 'invest.html',
  '/plan': 'invest.html',
  '/plan.html': 'invest.html',
  '/withdraw': 'invest.html',
  '/withdraw.html': 'invest.html',
  '/settings': 'invest.html',
  '/settings.html': 'invest.html',
  '/profile': 'invest.html',
  '/profile.html': 'invest.html'
};

function checkRoute() {
  const pathname = window.location.pathname.toLowerCase();
  
  // Check if current route is protected
  const route = Object.keys(protectedRoutes).find(r => pathname.endsWith(r));
  
  if (!route) return; // Not a protected route
  
  // Redirect anyone trying to access protected routes
  console.log('Protected route accessed, redirecting to invest.html');
  window.location.replace(protectedRoutes[route]);
}

// Run on page load
document.addEventListener('DOMContentLoaded', checkRoute);
checkRoute(); // Also run immediately
