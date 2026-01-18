# Route mapping app

This route mapping application is designed to assist runners in planning routes. Sometimes you know your start and end point but you need to fit in a certain distance between them.

## Idea Backlog/To do list
- Drag and drop waypoints on the map.
    I want markers for the extra waypoints when they are manually added, and I want to be able to drag these to update them.
- Generally the route finding algorithm needs work
    I'd like to look at if it is possible to use common strava routes in the plotting algorithm.
    When I add way points and also specify a distance, the algorithm of calculating extra way points doesn't work very well.
    Loop routes, so just specify start/end point and itll create a loop rather than the zig zagging.
- I want users to be able to save their routes. With this I will also look at having user profiles and a logging in mechanism, maybe link it to strava account.


## Running the app locally

`yarn install`, `yarn build` and `yarn start` will bring the app up on localhost:3000. The current published version can be seen at https://plan-my-run-route.vercel.app/.

## V0 Integration

I use v0 to assist me in development. It provides assistance with code but also the main benefit I find is how easy it is to deploy and share apps. I try to use v0 as a peer, like I'm pair programming, to help me learn more, rather than vibe coding through all of it.

_Automatically synced with your [v0.app](https://v0.app) deployments_

[![Deployed on Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-black?style=for-the-badge&logo=vercel)](https://vercel.com/loisconways-projects/v0-route-mapping-app)

## Overview

This repository will stay in sync with your deployed chats on [v0.app](https://v0.app).
Any changes you make to your deployed app will be automatically pushed to this repository from [v0.app](https://v0.app).

## Deployment

Your project is live at:

**[https://vercel.com/loisconways-projects/v0-route-mapping-app](https://vercel.com/loisconways-projects/v0-route-mapping-app)**
