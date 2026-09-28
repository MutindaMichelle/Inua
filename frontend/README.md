# Frontend (not yet started)

This folder will hold the React.js frontend (Section 3.5.2), built from
the wireframes in `design/wireframes/` and the interactive prototype in
`design/prototypes/wireframe_prototype_interactive.html`.

## Planned structure (fill in as you build)

```
frontend/
├── src/
│   ├── pages/
│   │   ├── mentee/        # matches design/wireframes/mentee_flow.png
│   │   ├── mentor/        # matches design/wireframes/mentor_flow.png
│   │   └── admin/         # matches design/wireframes/admin_flow.png
│   ├── components/
│   └── api/                # calls to the backend REST endpoints
├── package.json
└── public/
```

## Before you start

- Open `design/prototypes/wireframe_prototype_interactive.html` in a browser first -- it's the interaction reference (what's clickable, what updates live) for the real build.
- Scaffold with Vite (`npm create vite@latest . -- --template react`) rather than Create React App.
