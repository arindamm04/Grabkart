import { Show, SignInButton, SignUpButton, UserButton } from '@clerk/react'
import PageLoader from './components/PageLoader.jsx'
import { useAuth } from "@clerk/react";
import { Layout } from 'lucide-react';

function App() {
  const { isLoaded } = useAuth();

  if (!isLoaded) {
    return <PageLoader />;
  }


  return (
    <Layout>
      <header>
        <Show when="signed-out">
          <SignInButton mode='modal' />
          <SignUpButton mode='modal' />
        </Show>
        <Show when="signed-in">
          <UserButton />
        </Show>
      </header>

      <p className="text-red-500" font-extrabold text-4xl bg-blue>Hello</p>
      <button className="btn btn-primary">Button</button>
    </Layout>
  )
}

export default App
