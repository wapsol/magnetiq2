This is the specification for the webapp_deployer, a Go-lang based Kubernetes deployment tool for Go/React based web-applications, run from the command-line.

Apps can be deployed to staging, production or simply test/trial runs.


## Task

- Build the webapp_deployer into a binary executable.
- Self-test it.

## Web Application Architecture

Usually the architecture is:

1. Go based backend.
2. API driven backend.
3. A frontend written in a REACT based framework.
4. An SQL or NoSQL database, usually contained or referenced in /data/ folder.

## File Organisation

/frontend/ carries its own config file.
/backend/ caries its own config file.
There is a site.conf file carrying overall end-point configuration.

## Kubernetes Environment

- k0s based
- Longhorn provides persistent storage
- Container-repo is running Harbor.

## webapp_deployer - config variables and parameters

The webapp_deployer accepts config variables via a config-file, as well as command line parameters.

### Config file variables

- container_registry: from where Docker containers are downloaded.

### CLI parameters

- verbose
- name of the application
- source of webapp code on Github
- URL where webapp will be deployed (to load on HTTP browsers)
- self-test, performs a dry-run and checks if all endpoints and commands the deployer needs are ready to go!

## Deployment Spec

Programmers of the web-application being deployed provide a deployment file, usually calleddeployment.md. The webapp_deployer respects instructions from this file.

## Process of Deployment

The webapp_deployer takes a step by step approach for deploying apps to production, staging or testing.

- Find the deployment.md in the code-base of the application.
- In all cases, it first checks for the architectural integrity of the code-base.
- It then checks if each of the components have been found, and accessible - example, if data can be read from the database.
- It builds the backend Docker images and checks if they are accesible via API calls, at exactly the URL and port specified in the application's deployment.md

## Extensive Testing

The webapp_deployer extensively tests the application it just deployed, including every mentioned in Architecture and Components.
This includes if backend is loading, API is accessible, frontend is loading, users can log into the frontend and frontend inner-pages are accessible.

## Code Management

Keep downloaded code in a temporary cache.
Provide an option to cleanup the downloaded code.

## Deployment Modes

### Test Mode

- Before deploying in test-mode, clean up all previous tests (default).

- Staging, at a URL that is defined in the docs/spec_v2_current/deployment.md file for the respective version of the source tree.

- Production URL, focus on performance, security and stability.
