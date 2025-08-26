import React from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, CheckCircle, Users, Clock, Shield } from 'lucide-react'

export function HomePage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-primary-600">Fenstri</h1>
            </div>
            <nav className="hidden md:flex space-x-8">
              <Link to="/services" className="text-gray-600 hover:text-gray-900">Services</Link>
              <Link to="/contact" className="text-gray-600 hover:text-gray-900">Kontakt</Link>
            </nav>
            <div className="flex items-center space-x-4">
              <Link to="/login" className="text-gray-600 hover:text-gray-900">Anmelden</Link>
              <Link to="/register" className="btn btn-primary">Registrieren</Link>
              <Link to="/portal" className="text-gray-600 hover:text-gray-900">Portal</Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-primary-600 to-primary-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Professioneller Fensterservice für Unternehmen
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-primary-100">
              Wartung, Reparatur und Inspektion Ihrer Fenster mit modernster Technologie
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <div className="flex flex-col sm:flex-row gap-4">
                <Link to="/register?role=customer" className="bg-white text-primary-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors">
                  Als Kunde registrieren
                </Link>
                <Link to="/register?role=technician" className="bg-primary-500 text-white px-8 py-3 rounded-lg font-semibold hover:bg-primary-400 transition-colors">
                  Als Techniker registrieren
                </Link>
              </div>
              <Link to="/services" className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-primary-600 transition-colors">
                Services entdecken
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Warum Fenstri wählen?
            </h2>
            <p className="text-xl text-gray-600">
              Moderne Lösungen für professionellen Fensterservice
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-primary-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-primary-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Expertenteam</h3>
              <p className="text-gray-600">
                Zertifizierte Techniker mit jahrelanger Erfahrung im Fensterservice
              </p>
            </div>

            <div className="text-center">
              <div className="bg-primary-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Clock className="w-8 h-8 text-primary-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Schnelle Reaktion</h3>
              <p className="text-gray-600">
                24/7 Notfallservice und flexible Terminplanung nach Ihren Bedürfnissen
              </p>
            </div>

            <div className="text-center">
              <div className="bg-primary-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="w-8 h-8 text-primary-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Vollversichert</h3>
              <p className="text-gray-600">
                Umfassende Versicherung und Garantie auf alle Arbeiten
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Unsere Services
            </h2>
            <p className="text-xl text-gray-600">
              Komplettlösungen für alle Ihre Fenster-Bedürfnisse
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="card p-6">
              <h3 className="text-xl font-semibold mb-4">Wartung</h3>
              <ul className="space-y-2 mb-6">
                <li className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
                  Regelmäßige Inspektion
                </li>
                <li className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
                  Reinigung und Pflege
                </li>
                <li className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
                  Präventive Maßnahmen
                </li>
              </ul>
              <Link to="/services" className="text-primary-600 font-semibold flex items-center">
                Mehr erfahren <ArrowRight className="w-4 h-4 ml-1" />
              </Link>
            </div>

            <div className="card p-6">
              <h3 className="text-xl font-semibold mb-4">Reparatur</h3>
              <ul className="space-y-2 mb-6">
                <li className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
                  Schnelle Reparaturen
                </li>
                <li className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
                  Ersatzteilservice
                </li>
                <li className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
                  Notfallservice
                </li>
              </ul>
              <Link to="/services" className="text-primary-600 font-semibold flex items-center">
                Mehr erfahren <ArrowRight className="w-4 h-4 ml-1" />
              </Link>
            </div>

            <div className="card p-6">
              <h3 className="text-xl font-semibold mb-4">Inspektion</h3>
              <ul className="space-y-2 mb-6">
                <li className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
                  Sicherheitsprüfung
                </li>
                <li className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
                  Energieeffizienz
                </li>
                <li className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
                  Compliance-Check
                </li>
              </ul>
              <Link to="/services" className="text-primary-600 font-semibold flex items-center">
                Mehr erfahren <ArrowRight className="w-4 h-4 ml-1" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-primary-600 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Bereit für professionellen Fensterservice?
          </h2>
          <p className="text-xl mb-8 text-primary-100">
            Starten Sie noch heute mit unserem kostenlosen Service
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/register?role=customer" className="bg-white text-primary-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors inline-flex items-center">
              Als Kunde registrieren <ArrowRight className="w-5 h-5 ml-2" />
            </Link>
            <Link to="/register?role=technician" className="bg-primary-500 text-white px-8 py-3 rounded-lg font-semibold hover:bg-primary-400 transition-colors inline-flex items-center">
              Als Techniker registrieren <ArrowRight className="w-5 h-5 ml-2" />
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-lg font-semibold mb-4">Fenstri</h3>
              <p className="text-gray-400">
                Professioneller Fensterservice für Unternehmen
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Services</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link to="/services" className="hover:text-white">Wartung</Link></li>
                <li><Link to="/services" className="hover:text-white">Reparatur</Link></li>
                <li><Link to="/services" className="hover:text-white">Inspektion</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Unternehmen</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link to="/contact" className="hover:text-white">Kontakt</Link></li>
                <li><Link to="/contact" className="hover:text-white">Über uns</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Konto</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link to="/login" className="hover:text-white">Anmelden</Link></li>
                <li><Link to="/register" className="hover:text-white">Registrieren</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 Fenstri GmbH. Alle Rechte vorbehalten.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
