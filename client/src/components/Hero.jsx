import React from 'react'
import { useNavigate } from 'react-router-dom'
import { assets } from '../assets/assets'

const Hero = () => {
  const navigate = useNavigate()

  return (
    <div
      className="px-4 sm:px-20 xl:px-32 bg-cover bg-no-repeat min-h-screen flex items-center"
      style={{ backgroundImage: "url('/gradientBackground.png')" }} // ✅ if file is in public/
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 w-full">
        <div className="flex flex-col justify-center text-center lg:text-left">
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-6xl font-semibold leading-[1.2]">
            Transform your ideas into stunning <br />
            content using <span className="text-primary">AIzen</span>
          </h1>

          <p className="mt-4 text-gray-700">
            Create more. Work less. Let AI do the heavy lifting...
          </p>

          <div className="flex flex-wrap justify-center lg:justify-start gap-4 mt-6">
            <button
              onClick={() => navigate('/ai')}
              className="bg-primary text-white px-10 py-3 rounded-lg hover:scale-105 active:scale-95 transition"
            >
              Start creating now
            </button>

            <button className="text-primary bg-white px-10 py-3 rounded-lg hover:scale-105 active:scale-95 transition">
              Watch demo
            </button>
          </div>
        </div>

        <div className="flex justify-center items-center">
          <img
            src={assets.mt}
            alt="Hero Illustration"
            className="max-h-[280px] sm:max-h-[300px] lg:max-h-[450px] w-full lg:max-w-xl object-cover rounded-xl drop-shadow-xl"
          />
        </div>
      </div>
    </div>
  )
}

export default Hero
