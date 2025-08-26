# Admin Features

## Menu points 

Menu points to the left on the backend are:

- Consultants
- Webinars
- Users
- Integerations
- Settings

## Features

### Consultants

1. Loads at http://localhost:8088/admin/consultants
2. Lists all consultants, add a new consultant and "take offline" existing ones.
3. Add details to each consultant which would be used on public frontend features like Book a Meeting, Webinar etc. Save our LinkedIn profiles also.

### Webinar

1. Loads at http://localhost:8088/admin/webinars
2. CRUD Webinars
3. Support all the frontend features at http://localhost:8088/webinar

### Users 

1. Loads at http://localhost:8088/admin/users
2. CRUD Users who have access to Admin.
3. Generate and save cryptic password.
4. Trigger a password reset process.

### Integrations

tbc

## Login to Admin

1. Provide a link to user to trigger a password reset process.
2. Username is the same as email address.

# Tests

## Available Tests

Review the test-stack and update in this section the list of tests that have already been implemented.

## New Tests

For the functionality that has just been implemented, write new test scripts

## Always Test

Before implementing more than 200 lines of new functional code (excluding look & feel code), always run the whole test-stack.

# General Instructions

## Frontend

1. Make all frontend changes equivalently in the English and German languages.

## Database

1. As new features get developed, keep optimising the database schema.
2. Always take a database backup if schema is changed.