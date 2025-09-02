import { useLanguage } from '../../contexts/LanguageContext'
import { backgrounds, textColors, getCardClasses, getSectionClasses } from '../../utils/styling'

const ImprintPage = () => {
  const { language } = useLanguage()

  return (
    <div className={`min-h-screen ${backgrounds.pageAlt}`}>
      <div className="container py-16">
        <h1 className={`text-4xl font-bold ${textColors.primary} mb-8`}>
          {language === 'en' ? 'Imprint' : 'Impressum'}
        </h1>
        
        <div className={`${backgrounds.card} rounded-lg p-8 shadow-lg`}>
          <div className="prose prose-lg dark:prose-invert max-w-none">
            {language === 'en' ? (
              <>
                <h2>Company Information</h2>
                <p>
                  <strong>voltAIc Systems GmbH</strong><br />
                  AI Data Intelligence Solutions<br />
                  Königstraße 78<br />
                  70173 Stuttgart<br />
                  Germany
                </p>

                <h2>Contact</h2>
                <p>
                  Phone: +49 711 7947 2394<br />
                  Email: datadriven@voltaic.systems<br />
                  Website: https://voltaic.systems
                </p>

                <h2>Management</h2>
                <p>
                  Managing Directors:<br />
                  [Name of Managing Director]
                </p>

                <h2>Registry Court</h2>
                <p>
                  District Court Stuttgart<br />
                  Registration Number: HRB [NUMBER]<br />
                  VAT ID: DE[NUMBER]
                </p>

                <h2>Responsible for Content</h2>
                <p>
                  According to § 55 Abs. 2 RStV:<br />
                  [Name of Responsible Person]<br />
                  voltAIc Systems GmbH<br />
                  Königstraße 78<br />
                  70173 Stuttgart
                </p>

                <h2>Disclaimer</h2>
                <p>
                  Despite careful content control, we assume no liability for the content of external links. 
                  The operators of the linked pages are exclusively responsible for their content.
                </p>
              </>
            ) : (
              <>
                <h2>Angaben gemäß § 5 TMG</h2>
                <p>
                  <strong>voltAIc Systems GmbH</strong><br />
                  AI Data Intelligence Solutions<br />
                  Königstraße 78<br />
                  70173 Stuttgart<br />
                  Deutschland
                </p>

                <h2>Kontakt</h2>
                <p>
                  Telefon: +49 711 7947 2394<br />
                  E-Mail: datadriven@voltaic.systems<br />
                  Website: https://voltaic.systems
                </p>

                <h2>Geschäftsführung</h2>
                <p>
                  Geschäftsführer:<br />
                  [Name des Geschäftsführers]
                </p>

                <h2>Registereintrag</h2>
                <p>
                  Amtsgericht Stuttgart<br />
                  Handelsregisternummer: HRB [NUMMER]<br />
                  Umsatzsteuer-ID: DE[NUMMER]
                </p>

                <h2>Verantwortlich für den Inhalt</h2>
                <p>
                  Nach § 55 Abs. 2 RStV:<br />
                  [Name der verantwortlichen Person]<br />
                  voltAIc Systems GmbH<br />
                  Königstraße 78<br />
                  70173 Stuttgart
                </p>

                <h2>Haftungsausschluss</h2>
                <p>
                  Trotz sorgfältiger inhaltlicher Kontrolle übernehmen wir keine Haftung für die Inhalte externer Links. 
                  Für den Inhalt der verlinkten Seiten sind ausschließlich deren Betreiber verantwortlich.
                </p>

                <h2>Datenschutz</h2>
                <p>
                  Die Nutzung unserer Webseite ist in der Regel ohne Angabe personenbezogener Daten möglich. 
                  Soweit auf unseren Seiten personenbezogene Daten erhoben werden, erfolgt dies, soweit möglich, 
                  stets auf freiwilliger Basis.
                </p>

                <h2>Urheberrecht</h2>
                <p>
                  Die durch die Seitenbetreiber erstellten Inhalte und Werke auf diesen Seiten unterliegen dem 
                  deutschen Urheberrecht. Die Vervielfältigung, Bearbeitung, Verbreitung und jede Art der Verwertung 
                  außerhalb der Grenzen des Urheberrechtes bedürfen der schriftlichen Zustimmung des jeweiligen Autors 
                  bzw. Erstellers.
                </p>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default ImprintPage