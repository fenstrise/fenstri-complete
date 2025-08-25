import React from 'react'
import { useParams, Link } from 'react-router-dom'

export function LocationPage() {
  const { location } = useParams<{ location: string }>()

  const locationData = {
    'berlin': {
      title: 'Berlin',
      description: 'Professioneller Fensterservice in der Hauptstadt',
      serviceAreas: ['Mitte', 'Charlottenburg', 'Kreuzberg', 'Prenzlauer Berg', 'Friedrichshain'],
      specialties: [
        'Denkmalschutz-konforme Lösungen',
        'Moderne Bürogebäude',
        'Historische Gebäude'
      ]
    },
    'hamburg': {
      title: 'Hamburg',
      description: 'Fensterservice für die Hansestadt',
      serviceAreas: ['Altstadt', 'HafenCity', 'Eimsbüttel', 'Altona', 'Wandsbek'],
      specialties: [
        'Maritime Umgebung',
        'Hafengebäude',
        'Geschäftszentren'
      ]
    },
    'muenchen': {
      title: 'München',
      description: 'Fensterservice in der bayerischen Metropole',
      serviceAreas: ['Maxvorstadt', 'Schwabing', 'Bogenhausen', 'Lehel', 'Glockenbachviertel'],
      specialties: [
        'Alpine Witterungsbedingungen',
        'Traditionelle Architektur',
        'Moderne Geschäftsviertel'
      ]
    }
  }

  const data = locationData[location as keyof typeof locationData] || locationData['berlin']

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <Link to="/" className="text-2xl font-bold text-primary-600">Fenstri</Link>
            </div>
            <nav className="hidden md:flex space-x-8">
              <Link to="/services" className="text-gray-600 hover:text-gray-900">Services</Link>
              <Link to="/contact" className="text-gray-600 hover:text-gray-900">Kontakt</Link>
            </nav>
            <div className="flex items-center space-x-4">
              <Link to="/login" className="text-gray-600 hover:text-gray-900">Anmelden</Link>
              <Link to="/register" className="btn btn-primary">Registrieren</Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-primary-600 to-primary-800 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            Fensterservice {data.title}
          </h1>
          <p className="text-xl text-primary-100">
            {data.description}
          </p>
        </div>
      </section>

      {/* Content */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Servicegebiete</h2>
              <div className="grid grid-cols-2 gap-4">
                {data.serviceAreas.map((area, index) => (
                  <div key={index} className="bg-gray-50 p-4 rounded-lg text-center">
                    <span className="font-medium text-gray-900">{area}</span>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Lokale Spezialisierungen</h2>
              <ul className="space-y-4">
                {data.specialties.map((specialty, index) => (
                  <li key={index} className="flex items-start">
                    <span className="bg-primary-100 text-primary-600 rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold mr-3 mt-0.5">
                      ✓
                    </span>
                    <span className="text-gray-700">{specialty}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-primary-600 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4">
            Lokaler Service in {data.title}
          </h2>
          <p className="text-xl mb-8 text-primary-100">
            Schnelle Anfahrt und lokale Expertise
          </p>
          <Link to="/register" className="bg-white text-primary-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors">
            Service anfragen
          </Link>
        </div>
      </section>
    </div>
  )
}
