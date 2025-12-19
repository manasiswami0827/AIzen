import React, { useEffect, useState } from 'react'
import { dummyCreationData } from '../assets/assets'
import { Gem, Sparkles } from 'lucide-react'
import { Protect, useAuth, useUser } from '@clerk/clerk-react'
import CreationItems from '../components/CreationItems'
import axios from 'axios'
import toast from 'react-hot-toast'

axios.defaults.baseURL = import.meta.env.VITE_BASE_URL

const Dashboard = () => {

  const [creations, setCreations] = useState([])
  const [loading, setLoading] = useState(true)
  const { getToken } = useAuth()

  const { user } = useUser();
const plan = user?.privateMetadata?.plan === 'premium' ? 'Premium' : 'Free';

  const getDashboardData = async () => {
    try {
      const { data } = await axios.get('/api/user/get-user-creations', {
        headers: { Authorization: `Bearer ${await getToken()}` }
      })
      if (data.success) {
        setCreations(data.creations)
        setLoading(false)
      } else {
        toast.error(data.message)
      }
    } catch (error) {
      toast.error(error.message)
    }
  }

  useEffect(() => {
    getDashboardData()
  }, [])

  return (
    <div className='h-full overflow-scroll p-6'>
      <div className='flex justify-start gap-4 flex-wrap'>

        <div className='flex justify-between items-center w-72 p-4 px-6 bg-white rounded-xl border border-gray-200'>
          <div className='text-slate-600'>
            <p className='text-sm'>Total Creations</p>
            <h2 className='text-xl font-semibold'>{creations.length} </h2>
          </div>
          <div className='w-10 h-10 rounded-lg  text-white flex justify-center items-center'>
            <Sparkles className='w-5 bg-gradient-to-br from-[#3588f2] to-[#0bb0d7]' />
          </div>

        </div>

        <div className='flex justify-between items-center w-72 p-4 px-6 bg-white rounded-xl border border-gray-200'>
          <div className='text-slate-600'>
            <p className='text-sm'>Active Plan</p>
            <h2 className='text-xl font-semibold'>{plan}</h2>
          </div>
          <div className='w-10 h-10 rounded-lg bg-gradient-to-br from-[#ff61c5] to-[#9e53ee] text-white flex justify-center items-center'>
            <Gem className='w-5 text-white' />
          </div>

        </div>

      </div>
      {loading ? (
        <div className='flex justify-center items-center h-3/4'>
          <div className='animate-spin rounded-full h-11 w-11 border-3 border-purple-500 border-t-transparent'></div>
        </div>
      ) :
        (
          <div className='space-y-3'>
            <p className='mt-6 mb-4'>Recent Creations</p>
            {
              creations.map((item) => <CreationItems key={item.id} item={item} />)
            }
          </div>
        )}

    </div>
  )
}

export default Dashboard
