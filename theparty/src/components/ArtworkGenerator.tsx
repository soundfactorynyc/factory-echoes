'use client'
import React, { useState } from 'react'

// You'll need to add your API key to your environment variables
// OPENAI_API_KEY or REPLICATE_API_KEY

export default function ArtworkGenerator() {
  const [partyDetails, setPartyDetails] = useState({
    partyName: '',
    date: '',
    time: '',
    location: '',
    style: '',
    vibe: ''
  })
  const [artwork, setArtwork] = useState('')
  const [loading, setLoading] = useState(false)

  const generateArtwork = () => {
    if (!partyDetails.partyName) {
      alert('Please enter a party name')
      return
    }

    setLoading(true)
    setTimeout(() => {
      const artworkConcept = `🎨 PARTY ARTWORK CONCEPT

PARTY: "${partyDetails.partyName}"
DATE: ${partyDetails.date}
TIME: ${partyDetails.time}
LOCATION: ${partyDetails.location}

STYLE: ${partyDetails.style || 'Modern & Dynamic'}
VIBE: ${partyDetails.vibe || 'High Energy'}

DESIGN ELEMENTS:
• Custom typography for party name
• Dynamic background patterns
• Themed color scheme
• Event details layout
• Visual effects and textures

AVAILABLE FORMATS:
• Social Media Post (1080x1080)
• Instagram Story (1080x1920)
• Printed Flyer (A5)
• Digital Display (1920x1080)`

      setArtwork(artworkConcept)
      setLoading(false)
    }, 1000)
  }

  return (
    <div className="max-w-2xl mx-auto bg-gray-800/50 backdrop-blur-sm p-8 rounded-xl border border-gray-700">
      <div className="space-y-6">
        <div>
          <label className="block text-gray-300 mb-2">Party Name *</label>
          <input
            type="text"
            value={partyDetails.partyName}
            onChange={(e) => setPartyDetails({...partyDetails, partyName: e.target.value})}
            placeholder="Enter your party name"
            className="w-full p-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:border-purple-500 focus:ring-purple-500"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-gray-300 mb-2">Date</label>
            <input
              type="date"
              value={partyDetails.date}
              onChange={(e) => setPartyDetails({...partyDetails, date: e.target.value})}
              className="w-full p-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:border-purple-500 focus:ring-purple-500"
            />
          </div>
          <div>
            <label className="block text-gray-300 mb-2">Time</label>
            <input
              type="time"
              value={partyDetails.time}
              onChange={(e) => setPartyDetails({...partyDetails, time: e.target.value})}
              className="w-full p-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:border-purple-500 focus:ring-purple-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-gray-300 mb-2">Location</label>
          <input
            type="text"
            value={partyDetails.location}
            onChange={(e) => setPartyDetails({...partyDetails, location: e.target.value})}
            placeholder="Enter venue location"
            className="w-full p-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:border-purple-500 focus:ring-purple-500"
          />
        </div>

        <div>
          <label className="block text-gray-300 mb-2">Style</label>
          <select
            value={partyDetails.style}
            onChange={(e) => setPartyDetails({...partyDetails, style: e.target.value})}
            className="w-full p-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:border-purple-500 focus:ring-purple-500"
          >
            <option value="">Select style</option>
            <option value="Modern & Minimal">Modern & Minimal</option>
            <option value="Neon & Vibrant">Neon & Vibrant</option>
            <option value="Luxury & Elegant">Luxury & Elegant</option>
            <option value="Urban & Street">Urban & Street</option>
            <option value="Retro & Vintage">Retro & Vintage</option>
          </select>
        </div>

        <div>
          <label className="block text-gray-300 mb-2">Vibe</label>
          <select
            value={partyDetails.vibe}
            onChange={(e) => setPartyDetails({...partyDetails, vibe: e.target.value})}
            className="w-full p-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:border-purple-500 focus:ring-purple-500"
          >
            <option value="">Select vibe</option>
            <option value="High Energy">High Energy</option>
            <option value="Sophisticated">Sophisticated</option>
            <option value="Underground">Underground</option>
            <option value="Tropical">Tropical Paradise</option>
            <option value="Industrial">Industrial</option>
          </select>
        </div>

        <button
          onClick={generateArtwork}
          disabled={loading}
          className="w-full bg-purple-600 hover:bg-purple-500 text-white py-3 rounded-md transition-colors disabled:bg-purple-800 disabled:cursor-not-allowed text-lg font-semibold"
        >
          {loading ? 'Generating Artwork...' : 'Generate Artwork'}
        </button>

        {artwork && (
          <div className="mt-6">
            <div className="bg-gray-700/50 rounded-lg p-6 text-gray-200 whitespace-pre-line">
              {artwork}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
