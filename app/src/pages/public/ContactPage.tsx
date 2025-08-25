import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { Mail, Phone, MapPin, Clock, Send } from 'lucide-react'

export function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    phone: '',
    service: '',
    message: ''
  })
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // In a real app, this would send the form data to your backend
    console.log('Contact form submitted:', formData)
    setSubmitted(true)
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

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
              <Link to="/contact" className="text-primary-600 font-semibold">Kontakt</Link>
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
            Kontakt
          </h1>
          <p className="text-xl text-primary-100">
            Wir sind für Sie da - kontaktieren Sie uns jederzeit
          </p>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12">
            
            {/* Contact Information */}
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-8">
                Sprechen Sie mit uns
              </h2>
              <p className="text-lg text-gray-600 mb-8">
                Unser Team steht Ihnen gerne zur Verfügung. Kontaktieren Sie uns für ein unverbindliches Beratungsgespräch oder bei Fragen zu unseren Services.
              </p>

              <div className="space-y-6">
                <div className="flex items-start">
                  <div className="bg-primary-100 p-3 rounded-lg mr-4">
                    <Phone className="w-6 h-6 text-primary-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Telefon</h3>
                    <p className="text-gray-600">+49 30 123 456 789</p>
                    <p className="text-sm text-gray-500">Mo-Fr 8:00-18:00 Uhr</p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="bg-primary-100 p-3 rounded-lg mr-4">
                    <Mail className="w-6 h-6 text-primary-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">E-Mail</h3>
                    <p className="text-gray-600">info@fenstri.de</p>
                    <p className="text-sm text-gray-500">Antwort innerhalb von 24h</p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="bg-primary-100 p-3 rounded-lg mr-4">
                    <MapPin className="w-6 h-6 text-primary-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Adresse</h3>
                    <p className="text-gray-600">
                      Musterstraße 123<br />
                      10115 Berlin<br />
                      Deutschland
                    </p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="bg-primary-100 p-3 rounded-lg mr-4">
                    <Clock className="w-6 h-6 text-primary-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Notfallservice</h3>
                    <p className="text-gray-600">24/7 verfügbar</p>
                    <p className="text-sm text-gray-500">+49 30 123 456 999</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Form */}
            <div className="card p-8">
              {submitted ? (
                <div className="text-center">
                  <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Send className="w-8 h-8 text-green-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    Nachricht gesendet!
                  </h3>
                  <p className="text-gray-600 mb-6">
                    Vielen Dank für Ihre Anfrage. Wir werden uns schnellstmöglich bei Ihnen melden.
                  </p>
                  <button
                    onClick={() => setSubmitted(false)}
                    className="btn btn-primary"
                  >
                    Neue Nachricht senden
                  </button>
                </div>
              ) : (
                <>
                  <h3 className="text-2xl font-bold text-gray-900 mb-6">
                    Nachricht senden
                  </h3>
                  
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="name" className="form-label">
                          Name *
                        </label>
                        <input
                          type="text"
                          id="name"
                          name="name"
                          required
                          className="form-input"
                          value={formData.name}
                          onChange={handleChange}
                        />
                      </div>
                      <div>
                        <label htmlFor="email" className="form-label">
                          E-Mail *
                        </label>
                        <input
                          type="email"
                          id="email"
                          name="email"
                          required
                          className="form-input"
                          value={formData.email}
                          onChange={handleChange}
                        />
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="company" className="form-label">
                          Unternehmen
                        </label>
                        <input
                          type="text"
                          id="company"
                          name="company"
                          className="form-input"
                          value={formData.company}
                          onChange={handleChange}
                        />
                      </div>
                      <div>
                        <label htmlFor="phone" className="form-label">
                          Telefon
                        </label>
                        <input
                          type="tel"
                          id="phone"
                          name="phone"
                          className="form-input"
                          value={formData.phone}
                          onChange={handleChange}
                        />
                      </div>
                    </div>

                    <div>
                      <label htmlFor="service" className="form-label">
                        Gewünschter Service
                      </label>
                      <select
                        id="service"
                        name="service"
                        className="form-input"
                        value={formData.service}
                        onChange={handleChange}
                      >
                        <option value="">Bitte wählen...</option>
                        <option value="maintenance">Wartung</option>
                        <option value="repair">Reparatur</option>
                        <option value="inspection">Inspektion</option>
                        <option value="consultation">Beratung</option>
                        <option value="other">Sonstiges</option>
                      </select>
                    </div>

                    <div>
                      <label htmlFor="message" className="form-label">
                        Nachricht *
                      </label>
                      <textarea
                        id="message"
                        name="message"
                        rows={4}
                        required
                        className="form-input"
                        placeholder="Beschreiben Sie Ihr Anliegen..."
                        value={formData.message}
                        onChange={handleChange}
                      />
                    </div>

                    <button
                      type="submit"
                      className="btn btn-primary w-full flex items-center justify-center"
                    >
                      <Send className="w-4 h-4 mr-2" />
                      Nachricht senden
                    </button>
                  </form>
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-primary-600 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4">
            Bereit für den nächsten Schritt?
          </h2>
          <p className="text-xl mb-8 text-primary-100">
            Registrieren Sie sich kostenlos und starten Sie noch heute
          </p>
          <Link to="/register" className="bg-white text-primary-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors">
            Jetzt registrieren
          </Link>
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
