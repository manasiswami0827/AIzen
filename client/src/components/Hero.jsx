import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { assets } from '../assets/assets'

const Hero = () => {
  const navigate = useNavigate()

  const images = [
    assets.mt,
    assets.dream,
    assets.believe,
    assets.technology,
    assets.robot,
  ]

  const [currentImage, setCurrentImage] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImage((prev) => (prev + 1) % images.length)
    }, 5000)

    return () => clearInterval(interval)
  }, [images.length])

  return (
    <section
      className="pt-28 px-4 xl:px-32 bg-cover bg-no-repeat min-h-screen"
      style={{ backgroundImage: "url('/gradientBackground.png')" }}
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 w-full">

        {/* LEFT CONTENT */}
        <div className="flex flex-col text-center lg:text-left mt-10">
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-6xl font-semibold leading-tight">
            Transform your ideas into stunning <br />
            content using <span className="text-primary">AIzen</span>
          </h1>

          <p className="mt-4 text-gray-700 max-w-xl mx-auto lg:mx-0">
            Create more. Work less. Let AI do the heavy lifting...
          </p>

          <div className="flex flex-wrap justify-center lg:justify-start gap-4 mt-6">
            <button
              onClick={() => navigate('/ai')}
              className="bg-primary text-white px-10 py-3 rounded-lg 
                         hover:scale-105 active:scale-95 transition-all"
            >
              Start creating now
            </button>

            <button
              className="text-primary bg-white px-10 py-3 rounded-lg 
                         hover:scale-105 active:scale-95 transition-all"
            >
              Watch demo
            </button>
          </div>
        </div>

        {/* RIGHT IMAGE */}
        <div className="flex justify-center mt-10">
          <img
            src={images[currentImage]}
            alt="Hero Illustration"
            className="w-full max-w-xl max-h-[450px]
                       object-contain rounded-xl
                       drop-shadow-xl transition-all duration-700"
          />
        </div>

      </div>
    </section>
  )
}

export default Hero
