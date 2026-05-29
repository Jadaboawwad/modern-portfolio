# Jehad Abu Awwad — Portfolio

Personal portfolio site for **Jehad Abu Awwad**, Software & Mechatronics Engineer based in **Amman, Jordan**. Showcases work across **AI · Web · Mobile**, mechatronics projects, services, and professional recommendations.

**Live site:** [jehadabuawwad.com](https://jehadabuawwad.com)  
**Repository:** [github.com/Jadaboawwad/modern-portfolio](https://github.com/Jadaboawwad/modern-portfolio)

---

## About

I build full-stack platforms, cross-platform mobile apps (Flutter), and intelligent automation systems — from B2B/B2C backends and admin dashboards to applied ML, NLP chatbots, and mechatronics engineering work.

**Focus areas**

- Full-stack platforms (Node.js, TypeScript, REST/GraphQL, auth, databases)
- Mobile apps (Flutter, BLoC, Clean Architecture, RTL/Arabic)
- Web dashboards (React, Redux, role-based access)
- AI / ML (classification, regression, RAG, prompt engineering)
- DevOps & delivery (Docker, CI/CD, nginx, SSL)
- Mechatronics & industrial systems (PLC, robotics, embedded)

---

## Site sections

| Route | Description |
| --- | --- |
| `/` | Hero, particle background, animated avatar |
| `/about` | Skills, experience, certificates, WakaTime stats |
| `/services` | Full-stack, mobile, web, AI/ML, DevOps offerings |
| `/work` | Project gallery with live demos and GitHub links |
| `/mecha-page` | Mechatronics & engineering achievements |
| `/testimonials` | Professional recommendations |
| `/contact` | Contact form (mailto to `jehadabuawwad@outlook.com`) |

---

## Tech stack

- **Framework:** [Next.js](https://nextjs.org/) 15 (Pages Router)
- **UI:** [React](https://react.dev/) 18, [Tailwind CSS](https://tailwindcss.com/)
- **Motion:** [Framer Motion](https://www.framer.com/motion/)
- **Effects:** [tsParticles](https://particles.js.org/) / react-tsparticles
- **Carousel:** [Swiper](https://swiperjs.com/)
- **Icons:** [React Icons](https://react-icons.github.io/react-icons/)
- **Deploy:** [Netlify](https://www.netlify.com/) with `@netlify/plugin-nextjs`

---

## Getting started

### Prerequisites

- Node.js 18+ (LTS recommended)
- npm, yarn, or pnpm

### Install & run locally

```bash
git clone git@github.com:Jadaboawwad/modern-portfolio.git
cd modern-portfolio
yarn install   # or npm install
yarn dev       # http://localhost:3000
```

### Scripts

| Command | Description |
| --- | --- |
| `yarn dev` | Start development server |
| `yarn build` | Production build |
| `yarn start` | Serve production build |
| `yarn lint` | Run ESLint |

---

## Project structure

```
modern-portfolio/
├── components/       # UI (Header, Nav, sliders, Avatar, particles, …)
├── data/             # workProjects.js, mechaProjects.js
├── pages/            # Next.js routes (index, about, work, contact, …)
├── public/           # Images, logos, work thumbnails
├── styles/           # globals.css, Tailwind entry
├── variants/         # Framer Motion animation variants
├── next.config.js
├── tailwind.config.js
└── netlify.toml      # Netlify build & Next.js plugin
```

**Content to customize**

- `data/workProjects.js` — portfolio project cards
- `data/mechaProjects.js` — mechatronics section
- `components/Socials.jsx` — LinkedIn, GitHub, CV links
- `pages/about/index.jsx` — skills, certs, bio copy
- `components/ServiceSlider.jsx` — service offerings

---

## Deployment

The site is configured for **Netlify**:

- Build command: `yarn run build`
- Publish directory: `.next`
- Plugin: `@netlify/plugin-nextjs`

Connect the repo in the Netlify dashboard or deploy via CLI. Environment variables are not required for the static/contact flow unless you add a backend later.

---

## Connect

- **LinkedIn:** [linkedin.com/in/jadabuawwad](https://www.linkedin.com/in/jadabuawwad/)
- **GitHub:** [github.com/jadaboawwad](https://github.com/jadaboawwad)
- **CV:** [Google Drive](https://drive.google.com/file/d/1rPgJzqRG_WPK88mK4jbskuYKMscXGC_x/view?usp=sharing)
- **Email:** jehadabuawwad@outlook.com

---

## Credits & license

UI and structure are based on the open-source [modern-portfolio](https://github.com/sanidhyy/modern-portfolio) template by [Sanidhya Kumar Verma](https://github.com/sanidhyy), adapted and extended for this personal site.

Licensed under the [MIT License](./LICENSE). See the license file for the original copyright notice from the template author.
