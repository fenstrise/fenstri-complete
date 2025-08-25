import React from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, CheckCircle, Wrench, Search, Shield } from 'lucide-react'

export function ServicesPage() {
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
              <Link to="/services" className="text-primary-600 font-semibold">Services</Link>
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
            Unsere Services
          </h1>
          <p className="text-xl text-primary-100">
            Professionelle Fensterservices für alle Ihre Bedürfnisse
          </p>
        </div>
      </section>

      {/* Services Detail */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-3 gap-12">
            
            {/* Wartung */}
            <div className="card p-8">
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mb-6">
                <Wrench className="w-8 h-8 text-blue-600" />
              </div>
              <h2 className="text-2xl font-bold mb-4">Wartung</h2>
              <p className="text-gray-600 mb-6">
                Regelmäßige Wartung verlängert die Lebensdauer Ihrer Fenster und sorgt für optimale Funktionalität.
              </p>
              
              <h3 className="font-semibold mb-3">Leistungen:</h3>
              <ul className="space-y-2 mb-6">
                <li className="flex items-start">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-2 mt-0.5" />
                  <span>Reinigung aller Fensterkomponenten</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-2 mt-0.5" />
                  <span>Schmierung beweglicher Teile</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-2 mt-0.5" />
                  <span>Dichtungsprüfung und -austausch</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-2 mt-0.5" />
                  <span>Beschlagsjustierung</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-2 mt-0.5" />
                  <span>Funktionsprüfung</span>
                </li>
              </ul>

              <div className="bg-gray-50 p-4 rounded-lg mb-6">
                <h4 className="font-semibold mb-2">Wartungsintervalle:</h4>
                <ul className="text-sm text-gray-600">
                  <li>• Bürogebäude: 6 Monate</li>
                  <li>• Industrieanlagen: 3 Monate</li>
                  <li>• Hochhäuser: 4 Monate</li>
                </ul>
              </div>

              <Link to="/register" className="btn btn-primary w-full flex items-center justify-center">
                Service anfragen <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </div>

            {/* Reparatur */}
            <div className="card p-8">
              <div className="bg-red-100 w-16 h-16 rounded-full flex items-center justify-center mb-6">
                <Shield className="w-8 h-8 text-red-600" />
              </div>
              <h2 className="text-2xl font-bold mb-4">Reparatur</h2>
              <p className="text-gray-600 mb-6">
                Schnelle und professionelle Reparaturen für alle Arten von Fensterschäden und Defekten.
              </p>
              
              <h3 className="font-semibold mb-3">Reparaturleistungen:</h3>
              <ul className="space-y-2 mb-6">
                <li className="flex items-start">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-2 mt-0.5" />
                  <span>Glasaustausch und -reparatur</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-2 mt-0.5" />
                  <span>Beschlagsreparatur</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-2 mt-0.5" />
                  <span>Rahmeninstandsetzung</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-2 mt-0.5" />
                  <span>Dichtungserneuerung</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-2 mt-0.5" />
                  <span>Notfallreparaturen</span>
                </li>
              </ul>

              <div className="bg-gray-50 p-4 rounded-lg mb-6">
                <h4 className="font-semibold mb-2">Reaktionszeiten:</h4>
                <ul className="text-sm text-gray-600">
                  <li>• Notfall: 2-4 Stunden</li>
                  <li>• Dringend: 24 Stunden</li>
                  <li>• Standard: 2-3 Werktage</li>
                </ul>
              </div>

              <Link to="/register" className="btn btn-primary w-full flex items-center justify-center">
                Reparatur anfragen <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </div>

            {/* Inspektion */}
            <div className="card p-8">
              <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mb-6">
                <Search className="w-8 h-8 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold mb-4">Inspektion</h2>
              <p className="text-gray-600 mb-6">
                Umfassende Inspektionen zur Sicherstellung der Sicherheit und Compliance Ihrer Fenster.
              </p>
              
              <h3 className="font-semibold mb-3">Inspektionsleistungen:</h3>
              <ul className="space-y-2 mb-6">
                <li className="flex items-start">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-2 mt-0.5" />
                  <span>Sicherheitsprüfung nach DIN</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-2 mt-0.5" />
                  <span>Energieeffizienz-Bewertung</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-2 mt-0.5" />
                  <span>Compliance-Überprüfung</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-2 mt-0.5" />
                  <span>Dokumentation und Berichterstattung</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-2 mt-0.5" />
                  <span>Empfehlungen für Verbesserungen</span>
                </li>
              </ul>

              <div className="bg-gray-50 p-4 rounded-lg mb-6">
                <h4 className="font-semibold mb-2">Inspektionsarten:</h4>
                <ul className="text-sm text-gray-600">
                  <li>• Jährliche Sicherheitsprüfung</li>
                  <li>• Energieaudit</li>
                  <li>• Compliance-Check</li>
                </ul>
              </div>

              <Link to="/register" className="btn btn-primary w-full flex items-center justify-center">
                Inspektion buchen <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Process Section */}
      <section className="bg-gray-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Unser Prozess</h2>
            <p className="text-xl text-gray-600">So einfach funktioniert unser Service</p>
          </div>

          <div className="grid md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="bg-primary-600 text-white w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                1
              </div>
              <h3 className="font-semibold mb-2">Anfrage stellen</h3>
              <p className="text-gray-600 text-sm">
                Beschreiben Sie Ihren Service-Bedarf über unser Online-Portal
              </p>
            </div>

            <div className="text-center">
              <div className="bg-primary-600 text-white w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                2
              </div>
              <h3 className="font-semibold mb-2">Termin vereinbaren</h3>
              <p className="text-gray-600 text-sm">
                Wir kontaktieren Sie zur Terminabstimmung
              </p>
            </div>

            <div className="text-center">
              <div className="bg-primary-600 text-white w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                3
              </div>
              <h3 className="font-semibold mb-2">Service durchführen</h3>
              <p className="text-gray-600 text-sm">
                Unsere Experten führen den Service professionell durch
              </p>
            </div>

            <div className="text-center">
              <div className="bg-primary-600 text-white w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                4
              </div>
              <h3 className="font-semibold mb-2">Dokumentation</h3>
              <p className="text-gray-600 text-sm">
                Sie erhalten einen detaillierten Servicebericht
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-primary-600 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4">
            Bereit für professionellen Fensterservice?
          </h2>
          <p className="text-xl mb-8 text-primary-100">
            Kontaktieren Sie uns für ein unverbindliches Angebot
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/register" className="bg-white text-primary-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors">
              Jetzt registrieren
            </Link>
            <Link to="/contact" className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-primary-600 transition-colors">
              Kontakt aufnehmen
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
