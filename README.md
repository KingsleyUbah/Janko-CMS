## JANKO CMS

JANKO is a content management system that allows you to sign up for an account and create a post. You're to provide the post body in markdown format (JANKO will parse the markdown into text).

Here's a short DEMO of the application:

[![Watch the video](https://img.youtube.com/vi/MGnj7CuweWs/hqdefault.jpg)](https://youtu.be/MGnj7CuweWs)

## Getting Started

1. Clone this project's source code to your local dev machine
2. Run `npm i` to install dependencies
3. Finally, run `node server.js` to start up the application

## APIs

You can also interact with JANKO via its APIs. This allows you to use the platform without needing to navigate its UI in your web browser.

> NOTE: To perform any operation via this API, you'll need to first log in (or register).

There are three sets of APIs in JANKO:

- `/auth`: Log into JANKO or register a new account
- `/profile`: Create and update user profile information
- `/articles`: Create, read, update and delete articles

Here's the full list of available endpoints:

| Endpoint               |                Description                 |  Type  |                                           Payload |
| :--------------------- | :----------------------------------------: | :----: | ------------------------------------------------: |
| `/auth/register`       |       Create a new account in JANKO        |  POST  |           `name`, `username`, `email`, `password` |
| `/auth/login`          |              Log in to JANKO               |  POST  |                            `username`, `password` |
| `/auth/logout`         |              Log out of JANKO              |  GET   |                                              none |
| `/api/profile/details` | Get details of the current user's profile  |  GET   |                                              none |
| `/api/profile/edit`    | Edit details of the current user's profile |  POST  |     `bio`, `location`, `image`, `isImageExternal` |
| `/api/articles`        |             Fetch all articles             |  GET   |                                              none |
| `/api/articles`        |        Save a new article to JANKO         |  POST  |                `title`, `description`, `markdown` |
| `/api/articles/:id`    |    Fetch a particular article by its ID    |  GET   |                                              none |
| `/api/articles/:id`    |   Update a particular article by its ID    | PATCH  | `title`, `description`, `markdown` (all optional) |
| `/api/articles/:id`    |   Delete a particular article by its ID    | DELETE |                                              none |
| `/database`            |         Delete the entire database         | DELETE |                                              none |

## Languages and Frameworks used in this project

- Node.js
- Express.js
- EJS
- TailwindCSS
- Mongoose
