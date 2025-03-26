import ArtworkGenerator from '@/components/ArtworkGenerator'
import VenueFinder from '@/components/VenueFinder'

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-purple-900 to-gray-900">
      {/* Navigation */}
      <nav className="bg-gray-800/50 backdrop-blur-sm">
        <div className="container mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-purple-400">YouThinkWeBuild</h1>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="container mx-auto px-6 py-20">
        <div className="text-center">
          <h2 className="text-6xl font-bold mb-6 text-white">
            Plan The Perfect
            <span className="block text-purple-400">Party</span>
          </h2>
          <p className="text-xl text-gray-300 mb-12">
            AI-Powered Event Planning Made Simple
          </p>

          {/* Feature Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-20">
            <div className="bg-gray-800/50 backdrop-blur-sm p-8 rounded-xl border border-gray-700 hover:border-purple-500 transition-colors">
              <div className="text-4xl mb-4">🎯</div>
              <h3 className="text-xl font-bold mb-2 text-white">Venue Matching</h3>
              <p className="text-gray-400">Find the perfect venue instantly</p>
            </div>

            <div className="bg-gray-800/50 backdrop-blur-sm p-8 rounded-xl border border-gray-700 hover:border-purple-500 transition-colors">
              <div className="text-4xl mb-4">🎨</div>
              <h3 className="text-xl font-bold mb-2 text-white">Theme Generator</h3>
              <p className="text-gray-400">Get unique party themes</p>
            </div>

            <div className="bg-gray-800/50 backdrop-blur-sm p-8 rounded-xl border border-gray-700 hover:border-purple-500 transition-colors">
              <div className="text-4xl mb-4">📅</div>
              <h3 className="text-xl font-bold mb-2 text-white">Smart Planning</h3>
              <p className="text-gray-400">AI-powered planning assistance</p>
            </div>
          </div>

          {/* Venue Finder Section */}
          <div className="mt-20">
            <h2 className="text-3xl font-bold mb-12 text-white">Find Your Perfect Venue</h2>
            <VenueFinder />
          </div>

          {/* Artwork Generator Section */}
          <div className="mt-20">
            <h2 className="text-3xl font-bold mb-12 text-white">Create Your Party Artwork</h2>
            <ArtworkGenerator />
          </div>

          {/* Call to Action */}
          <div className="mt-20">
            <button className="bg-purple-600 hover:bg-purple-500 text-white text-xl px-12 py-4 rounded-full transition-colors">
              Create Your Event
            </button>
          </div>
        </div>
      </main>
    </div>
  )
}
