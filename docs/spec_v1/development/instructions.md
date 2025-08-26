# New Instructions

- Implement these new instructions.

## Whitepaper Download

Our intention is to publish whitepapers on the website, for lead-generation. Audience is B2B strategic technology decision makers.

The files are downloaded from our own NextCloud server.
A new link valid for N-days (N can be set in Admin > Settings) is generated as soon as the user has validated their email address, and sent by a following email to him. After N-days, the link is automatically deleted (by a cron-called script in ./automation/ folder).

Introduce a Downloads section in Admin and let new Downloads be placed here. The Admin simply saves a Title, Author (from the Consultant list, or a new one), data-of-publication and link to the the original file on NextCloud, number of downloads, days since publication. Upon saving, a publication-link (with URL of the website) is created by the system, which is used by content writers to embed into their HTML-content (as URL, <a href>links</a>).

The backend authenticates with the NextCloud API and passes on data to the frontend via internal frontend-backend-API calls.

# Old Instructions

- The instructions below have already been coded.
- Check for the consistency of those features with the ones that will result from New Instructions above.

## Unify DOS-Standard and DOS-Basic  

On the public website, unify the content in http://localhost:8088/products/dos-standard and http://localhost:8088/products/dos-basic pages.

Do not loose unique content.
And do not repeat content.

Adjust the menus according to the consolidation of the content into a single menu point, the "Data Operating System".

## Relocate "Datenversprechen" menu point

Relocate "Datenversprechen" menu point to About Us.

## Rename Benutzeroberflächen

Rename the menu point Benutzeroberflächen to "SAFE - Anwendungsframework" / "SAFE - Application Framework"

Rename the "Interface Demo" to "Order a free demo of the Semantic Application Framework for Enterprise - SAFE"

Connect the "Interface Demo" button to an adapted version of "Book a Meeting", where we show a first screen with a couple of screenshots of the UI, with brief textual description, a header and some text at the bottom describing what we will cover in an "Interface Demo".

Evaluate dependencies on the existing features developed so far, especially related to Book a Meeting, and avoid conflicts or service deterioration.