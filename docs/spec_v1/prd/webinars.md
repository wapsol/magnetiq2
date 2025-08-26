Code, test and integrate following features into the Webinars feature of the MagnetIQ-CMS.

## Public frontend 

### Overview Page

- Tiled/boxed overview of all upcoming sessions, filterable by this week, month and all.
- Webinar title, date and time, short 10 word description, the speaker, duration and a small pic of the speaker.
- Consider timezone.
- Provide possibility to share on LinkedIn.

### Landing Page

- A detailed page with full description of the webinar and all other fields necessary for the attendee to decide on joining.
- Boxes at the bottom of the page displaying randomly 4 upcoming sessions.
- A box to show price, with a register button.
- Support both languages, translation and AI based generation (with ⚡️).
- Provide possibility to share on LinkedIn.

### Registration Modal

- A popup where attendees can register. 
- Accept terms and conditions.
- After registration, the last thank-you page provides downloads for Google Calendar and Outlook Calendar import files.
- Email validation for registration, and revisit to the modal final thank-you page. 
- Maintain registration session on the browser for a week, but tell the user that they can complete registration within 4 hours.
- On thank-you page also provide a LinkedIn share button to.
- Make sure to get a link to the website of the registrant.

### Footer

- In the site footer, add a column that lists the upcoming 4 sessions.
- Title this "Knowledge Program" / "Wissensprogramm"
- Link each to the webinar landing page.

## Admin Panel

- Link on the left menu.
- Tabs for Sessions, Topics, Speakers, Registrations and anything else needed for running a comprehensive webinar program
- A Settings tab where, for now, a Webinar Program Manager (WPM) can be selected. He's one of the Consultants

## Backend API

- API calls for all features.
- Token based legitimation between front and backend.
- API calls from external applications interacting with the backend.

## Automations

- Confirmation email to registrant and Webinar Program Manager.
- Send a mail reminder to all registrants in a session 7 and 2 days before event.
- Send a summary mail 3 days before the event to the speaker with 
  - number of attendees
  - Include a link to the public landing page  - online link to where the webinar will be held,
  - other such details which will help him to prepare himself for the session.
- Send a summary to the WPM, similar to the Speaker one, but as an attachment a text file with names and companies of registrants. 
  - Include a link to the AdminPanel, as also to the public landing page.
  - Consider timezones.
  - Brand email templates!

## Integration

- Get Topics from Odoo (Event) Products.
- New Topics created in Magnetiq are exportable at the click of a button to Odoo
- Create Odoo Events for each Session.
- Send to Odoo the regisration information which will be useful for confirming order and sending invoice, in case the webinar is to be paid for!
- Manage Odoo connections under Integrations > Odoo > Settings.