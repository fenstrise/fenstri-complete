import React from 'react'
import { useParams, Link } from 'react-router-dom'

export function IndustryPage() {
  const { industry } = useParams<{ industry: string }>()

  const industryData = {
    'buero': {
      title: 'Bürogebäude',
      description: 'Spezialisierte Fensterservices für Bürogebäude und Geschäftszentren',
      challenges: [
        'Hohe Frequentierung der Fenster',
        'Energieeffizienz-Anforderungen',
        'Minimale Betriebsunterbrechungen'
      ],
      solutions: [
        'Wartung außerhalb der Geschäftszeiten',
        'Energieeffiziente Fensterlösungen',
        'Schnelle Reparaturzeiten'
      ]
    },
    'industrie': {
      title: 'Industrieanlagen',
      description: 'Robuste Fensterlösungen für industrielle Umgebungen',
      challenges: [
        'Extreme Umgebungsbedingungen',
        'Sicherheitsanforderungen',
        'Kontinuierlicher Betrieb'
      ],
      solutions: [
        'Widerstandsfähige Materialien',
        'Sicherheitszertifizierte Verfahren',
        '24/7 Notfallservice'
      ]
    },
    'einzelhandel': {
      title: 'Einzelhandel',
      description: 'Attraktive und funktionale Fensterlösungen für Geschäfte',
      challenges: [
        'Schaufenster-Präsentation',
        'Kundenverkehr',
        'Sicherheitsaspekte'
      ],
      solutions: [
        'Professionelle Schaufensterreinigung',
        'Flexible Servicezeiten',
        'Sicherheitsglas-Service'
      ]
    }
  }

  const data = industryData[industry as keyof typeof industryData] || industryData['buero']

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
            {data.title}
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
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Herausforderungen</h2>
              <ul className="space-y-4">
                {data.challenges.map((challenge, index) => (
                  <li key={index} className="flex items-start">
                    <span className="bg-red-100 text-red-600 rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold mr-3 mt-0.5">
                      !
                    </span>
                    <span className="text-gray-700">{challenge}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Unsere Lösungen</h2>
              <ul className="space-y-4">
                {data.solutions.map((solution, index) => (
                  <li key={index} className="flex items-start">
                    <span className="bg-green-100 text-green-600 rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold mr-3 mt-0.5">
                      ✓
                    </span>
                    <span className="text-gray-700">{solution}</span>
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
            Spezialisierte Lösungen für {data.title}
          </h2>
          <p className="text-xl mb-8 text-primary-100">
            Kontaktieren Sie uns für eine individuelle Beratung
          </p>
          <Link to="/register" className="bg-white text-primary-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors">
            Jetzt anfragen
          </Link>
        </div>
      </section>
    </div>
  )
}
