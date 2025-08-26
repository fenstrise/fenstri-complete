import { Layout } from '../../components/Layout'

export function AboutPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-16 px-4 sm:py-24 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="text-4xl font-extrabold text-gray-900 sm:text-5xl">
            Über Fenstri
          </h1>
          <p className="mt-4 text-xl text-gray-600">
            Ihr Partner für professionellen Fensterservice
          </p>
        </div>

        <div className="mt-16">
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
            <div>
              <h2 className="text-3xl font-extrabold text-gray-900">
                Unser Unternehmen
              </h2>
              <p className="mt-4 text-lg text-gray-600">
                Fenstri ist ein führender Anbieter von Fensterservice-Lösungen für Unternehmen. 
                Mit jahrzehntelanger Erfahrung bieten wir umfassende Wartungs-, Reparatur- und 
                Installationsdienstleistungen für alle Arten von Fenstern und Türen.
              </p>
              <p className="mt-4 text-lg text-gray-600">
                Unsere Mission ist es, durch innovative Technologie und erstklassigen Service 
                die Effizienz und Qualität von Fensterdienstleistungen zu revolutionieren.
              </p>
            </div>

            <div>
              <h2 className="text-3xl font-extrabold text-gray-900">
                Unsere Werte
              </h2>
              <ul className="mt-4 space-y-4">
                <li className="flex items-start">
                  <div className="flex-shrink-0">
                    <div className="flex items-center justify-center h-6 w-6 rounded-full bg-blue-100 text-blue-600">
                      ✓
                    </div>
                  </div>
                  <p className="ml-3 text-lg text-gray-600">
                    <strong>Qualität:</strong> Höchste Standards in allen unseren Dienstleistungen
                  </p>
                </li>
                <li className="flex items-start">
                  <div className="flex-shrink-0">
                    <div className="flex items-center justify-center h-6 w-6 rounded-full bg-blue-100 text-blue-600">
                      ✓
                    </div>
                  </div>
                  <p className="ml-3 text-lg text-gray-600">
                    <strong>Zuverlässigkeit:</strong> Pünktlich und verlässlich bei jedem Auftrag
                  </p>
                </li>
                <li className="flex items-start">
                  <div className="flex-shrink-0">
                    <div className="flex items-center justify-center h-6 w-6 rounded-full bg-blue-100 text-blue-600">
                      ✓
                    </div>
                  </div>
                  <p className="ml-3 text-lg text-gray-600">
                    <strong>Innovation:</strong> Modernste Technologie für optimale Ergebnisse
                  </p>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
