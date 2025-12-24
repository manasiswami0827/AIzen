import React from 'react'
import { assets } from '../assets/assets'
import { useNavigate } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { useClerk, UserButton, useUser } from '@clerk/clerk-react'

const Navbar = () => {
  const navigate = useNavigate()
  const { user } = useUser()
  const { openSignIn } = useClerk()

  return (
    <header className="fixed top-0 left-0 z-50 w-full">
      <div
        className="h-20 backdrop-blur-2xl flex justify-between items-center 
                   px-4 sm:px-20 xl:px-32"
      >
        {/* Logo */}
        <img
          src={assets.logoAI}
          alt="logo"
          onClick={() => navigate('/')}
          className="w-16 h-16 cursor-pointer"
        />

        {/* Auth Button / User */}
        {user ? (
          <UserButton />
        ) : (
          <button
            onClick={openSignIn}
            className="flex items-center gap-2 rounded-full text-sm cursor-pointer 
                       bg-primary text-white px-8 py-2.5 
                       hover:scale-105 active:scale-95 transition"
          >
            Get Started
            <ArrowRight className="w-4 h-4" />
          </button>
        )}
      </div>
    </header>
  )
}

export default Navbar
