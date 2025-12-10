import React from 'react'
import { assets } from '../assets/assets';
import { Link } from 'react-router-dom';

const Footer=()=> {
    return (
        <footer className="px-6 md:px-16 lg:px-24 xl:px-32 pt-8 w-full text-gray-500 mr-4">
            <div className="flex flex-col md:flex-row justify-between w-full gap-10 border-b border-gray-500/30 pb-4">
                 <div className="md:max-w-100 ml-20 flex-col">
                    <img src={assets.logoAI} alt="" className='w-28 h-24 ml-25' />
                    <p className="mt-6 text-sm ml-20">
                     Our platform delivers fast, reliable, and intelligent AI-powered solutions. Built with modern technology, we provide secure, smart, and easy-to-use tools for everyone.
                    </p>
                 </div>
                 <div className="flex-1 flex items-start ml-50 sm:mr-7 gap-10">
                    {/* <div>
                        <h2 className="font-semibold mb-5 text-gray-800">Company</h2>
                        <ul className="text-sm space-y-2">
                            <li><a href="#">Home</a></li>
                            <li><a href="#">About us</a></li>
                            <li><a href="#">Contact us</a></li>
                            <li><a href="#">Privacy policy</a></li>
                        </ul>
                    </div> */}
                 <div>
                        <h2 className="text-4xl text-gray-800 mt-10 font-bold">Subscribe to our Aizen</h2>
                        <div className="text-sm space-y-2 mt-10">
                            <p>The latest news, articles, and resources, sent to your inbox weekly.</p>
                            <div className="flex items-center gap-2 pt-4">
                                <input className="border border-gray-500/30  placeholder-gray-500 focus:ring-2 ring-primary outline-none w-full max-w-64 h-9 rounded px-2" type="email" placeholder="Enter your email" />
                                <button className="bg-primary w-24 h-9 text-white rounded">Subscribe</button>
                            </div>
                        </div>
                        
                    </div>
                </div>
            </div>
            <p className="pt-4 text-center text-xs md:text-sm pb-5">
                Copyright  {new Date().getFullYear()}  © <Link>Aizen</Link>. All Right Reserved.
            </p>
        </footer>
    );
};

export default Footer
