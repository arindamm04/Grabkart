import { Show, SignInButton, SignUpButton, UserButton } from '@clerk/react'
import PageLoader from './components/PageLoader.jsx'
import { useAuth } from "@clerk/react";
import  Layout  from './components/Layout.jsx';
import HomePage from './pages/HomePage.jsx';
import { Route, Routes } from 'react-router'
import CartPage from "./pages/CartPage";

function App() {
  const { isLoaded, isSignedIn } = useAuth();

  if (!isLoaded) {
    return <PageLoader />;
  }


  return (
    <Layout>
      <Routes>
        <Route path="/*" element={<HomePage />} />
        <Route path="/cart" element={<CartPage />} />
        
      </Routes>
    
    </Layout>
  )
}

export default App
