# Birdnest drone tracker

Available at: https://birdnest-demo.fly.dev/

## Description

This demo is made for [Project Birdnest assignment](https://assignments.reaktor.com/birdnest/). On the front page you can see the closest confirmed drone distance and all violations during the past 10 minutes.

Additionally the raw data from backend (list of violations) can be viewed at `/api`.

## Project structure

- `backend` directory contains the backend (NodeJS) and static version of frontend
- `birdnest-frontend` directory contains the frontend source (React)

## Running the app locally
- On `backend` directory: `npm install` and `npm start` (this will serve the static version of frontend)
- If you want to run frontend separately, delete the `build` folder from `backend` and run `npm install` & `npm start` in `birdnest-frontend`