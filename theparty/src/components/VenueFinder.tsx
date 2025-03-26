'use client'
import React, { useState } from 'react'

export default function VenueFinder() {
  const [zipCode, setZipCode] = useState('')
  const [guestCount, setGuestCount] = useState('100-500')
  const [venueType, setVenueType] = useState('indoor')
  const [venues, setVenues] = useState('')
  const [loading, setLoading] = useState(false)

  const findVenues = () => {
    if (!zipCode || zipCode.length !== 5) {
      alert('Please enter a valid 5-digit ZIP code')
      return
    }

    setLoading(true)
    setTimeout(() => {
      const venueResults = `🏢 VENUES NEAR ${zipCode}

INDOOR VENUES:
• The Grand Ballroom
  - Capacity: 500 guests
  - Distance: 3.2 miles
  - Features: Dance floor, Stage, Bar
  - Contact: (555) 123-4567

• Luxury Event Space
  - Capacity: 300 guests
  - Distance: 5.1 miles
  - Features: Modern design, AV system
  - Contact: (555) 234-5678

OUTDOOR VENUES:
• Skyline Terrace
  - Capacity: 400 guests
  - Distance: 4.3 miles
  - Features: City views, Covered areas
  - Contact: (555) 345-6789

• Garden Paradise
  - Capacity: 250 guests
  - Distance: 6.7 miles
  - Features: Gardens, Water features
  - Contact: (555) 456-7890`

      setVenues(venueResults)
      setLoading(false)
    }, 1500)
  }

  return (
    <div className="max-w-2xl mx-auto bg-gray-800/50 backdrop-blur-sm p-8 rounded-xl border border-gray-700">
      <div className="space-y-6">
        <div>
          <label className="block text-gray-300 mb-2">ZIP Code *</label>
          <input
            type="text"
            value={zipCode}
            onChange={(e) => setZipCode(e.target.value.slice(0, 5))}
            placeholder="Enter ZIP code"
            maxLength={5}
            className="w-full p-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:border-purple-500 focus:ring-purple-500"
          />
        </div>

        <div>
          <label className="block text-gray-300 mb-2">Guest Count</label>
          <select
            value={guestCount}
            onChange={(e) => setGuestCount(e.target.value)}
            className="w-full p-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:border-purple-500 focus:ring-purple-500"
          >
            <option value="0-100">0-100 guests</option>
            <option value="100-500">100-500 guests</option>
            <option value="500-1000">500-1000 guests</option>
            <option value="1000+">1000+ guests</option>
          </select>
        </div>

        <div>
          <label className="block text-gray-300 mb-2">Venue Type</label>
          <select
            value={venueType}
            onChange={(e) => setVenueType(e.target.value)}
            className="w-full p-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:border-purple-500 focus:ring-purple-500"
          >
            <option value="indoor">Indoor</option>
            <option value="outdoor">Outdoor</option>
            <option value="rooftop">Rooftop</option>
            <option value="hybrid">Indoor/Outdoor Mix</option>
          </select>
        </div>

        <button
          onClick={findVenues}
          disabled={loading}
          className="w-full bg-purple-600 hover:bg-purple-500 text-white py-2 rounded-md transition-colors disabled:bg-purple-800 disabled:cursor-not-allowed"
        >
          {loading ? 'Searching...' : 'Find Venues'}
        </button>

        {venues && (
          <div className="mt-6">
            <div className="bg-gray-700/50 rounded-md p-6 text-gray-200 whitespace-pre-line">
              {venues}
            </div>
          </div>
        )}
      </div>
    </div>
  )
} 