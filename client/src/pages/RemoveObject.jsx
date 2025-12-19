import { useAuth } from '@clerk/clerk-react';
import { Eraser, Scissors, Sparkles } from 'lucide-react';
import React, { useState } from 'react';
import toast from 'react-hot-toast';
import axios from 'axios';

axios.defaults.baseURL = import.meta.env.VITE_BASE_URL;

const RemoveObject = () => {
  const [input, setInput] = useState('');
  const [object, setObject] = useState('');
  const [loading, setLoading] = useState(false);
  const [content, setContent] = useState('');

  const { getToken } = useAuth();

  const onSubmitHandler = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);

      // Check if more than one word is entered
      if (object.trim().split(' ').length > 1) {
        return toast.error('Please enter only one object name');
      }

      const formData = new FormData();
      formData.append('image', input);
      formData.append('object', object);

      const token = await getToken();
const { data } = await axios.post('/api/ai/remove-image-object', formData, {
  headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' }
});


      // const token = await getToken();
      // const { data } = await axios.post('/api/ai/remove-image-object', formData, {
      //   headers: { Authorization: `Bearer ${await getToken()}`}});
      
      if (data.success) {
        setContent(data.content);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-full overflow-y-scroll p-6 flex items-start flex-wrap gap-4 text-slate-400 text-slate-700">
      <form
        onSubmit={onSubmitHandler}
        className="w-full max-w-lg p-4 bg-white rounded-lg border border-gray-300"
      >
        <div className="flex items-center gap-3">
          <Sparkles className="w-6 text-[#613893]" />
          <h1 className="text-xl font-semibold">Object Removal</h1>
        </div>

        <p className="mt-6 text-sm font-medium">Upload Image</p>
        <input
          onChange={(e) => setInput(e.target.files[0])}
          accept="image/*"
          type="file"
          className="w-full p-2 px-3 mt-2 outline-none text-sm rounded-md border border-gray-300 text-gray-600"
          required
        />

        <p className="mt-6 text-sm font-medium">Describe Object name to remove</p>
        <textarea
          onChange={(e) => setObject(e.target.value)}
          value={object}
          rows={4}
          className="w-full p-2 mt-2 border rounded-md border-gray-300 text-gray-600"
          placeholder="e.g., watch or spoon (only single object name)"
          required
        ></textarea>

        <button
          className="w-full px-4 py-2 mt-6 rounded-lg flex justify-center text-white items-center gap-2 bg-gradient-to-r from-[#613893] to-[#dc96fc] cursor-pointer"
          disabled={loading}
        >
          {loading ? 'Removing...' : 'Remove object'}
        </button>
      </form>

      <div className="w-full max-w-lg p-4 bg-white rounded-lg flex flex-col border border-gray-200 min-h-96">
        <div className="flex items-center gap-3">
          <Scissors className="w-5 h-5 text-[#613893]" />
          <h1 className="text-xl font-semibold">Processed image</h1>
        </div>
        <div className="flex-1 flex justify-center items-center">
          {content ? (
            <img src={content} alt="Processed" className="max-h-96 object-contain" />
          ) : (
            <div className="text-sm flex flex-col items-center gap-5 text-gray-400">
              <Scissors className="w-9 h-9" />
              <p>Upload an image and click "Remove Object" to get started</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RemoveObject;
