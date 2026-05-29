/**
 * Projects from portfolio/src/views/examples/Landing.js
 * name = project title (top-left)
 * stack / label = tech / type (bottom bar); label falls back to stack in the slider
 * link = Live or GitHub; github / githubBackend when both exist
 */

export function getProjectLabel(project) {
  return project.label || project.stack || "";
}

const workProjects = [
  {
    name: "WeFix",
    stack: "Flutter · React OMS · Node · GraphQL · B2B/B2C",
    link: "https://wefix-system.com/",
    github: "https://github.com/We-Fix-Apps/wefix-frontend-oms",
    githubBackend: "https://github.com/We-Fix-Apps/wefix-backend-oms",
    path: "/work/work-wefix.png",
    fallbackPath: "/thumb1.jpg",
  },
  {
    name: "Nuqayyem",
    stack: "Flutter · GraphQL · Formative Assessment · HTU",
    link: "https://github.com/nuqayyem-application/nuqayyem",
    githubBackend: "https://github.com/nuqayyem-application/backend",
    path: "/work/work-nuqayyem.png",
    fallbackPath: "/thumb2.jpg",
  },
  {
    name: "Blinx",
    stack: "Flutter · Firebase · Chromecast · Apple TV · MENA",
    link: "https://blinx.com/",
    path: "/work/work-blinx.png",
    fallbackPath: "/thumb3.jpg",
  },
  {
    name: "ReStaged",
    stack: "TypeScript · Mobile · Furniture Rent & Sell",
    link: "https://restaged.com/",
    path: "/work/work-restaged.png",
    fallbackPath: "/thumb4.jpg",
  },
  {
    name: "WeMedica",
    stack: "ML Classification · Web App",
    link: "https://wemedica.netlify.app/",
    github: "https://github.com/SuperbaTeam/ai-medica-front-end",
    githubBackend: "https://github.com/SuperbaTeam/ai-medica-back-end",
    path: "/work/work-aimedica.png",
    fallbackPath: "/thumb2.jpg",
  },
  {
    name: "People Thinks",
    stack: "Deep Learning · NLP",
    link: "https://github.com/machine-learning-solutions/people_thinks",
    path: "/work/work-people-thinks.png",
    fallbackPath: "/thumb2.jpg",
  },
  {
    name: "SeAssis",
    stack: "Web App · NLP",
    link: "https://seassis-web.netlify.app/",
    github: "https://github.com/jaa-web-applications/seassis",
    githubBackend: "https://github.com/jaa-web-applications/seassis-backend",
    path: "/work/work-seassis.png",
    fallbackPath: "/thumb3.jpg",
  },
  {
    name: "PyArcade Games",
    stack: "Python · CLI Games",
    link: "https://github.com/jaa-games/pyarcade_games",
    path: "/work/work-pyarcade-games.png",
    fallbackPath: "/thumb1.jpg",
  },
  {
    name: "Game of Greed",
    stack: "Python · CLI Game",
    link: "https://github.com/jaa-games/game_of_greed",
    path: "/work/work-game-of-greed.png",
    fallbackPath: "/thumb4.jpg",
  },
  {
    name: "Country Quiz",
    stack: "Next.js · Quiz App",
    link: "https://jaa-country-quiz.netlify.app/",
    path: "/work/work-country-quiz.png",
    fallbackPath: "/thumb3.jpg",
  },
  {
    name: "Huddle",
    stack: "Next.js · Styled Components",
    link: "https://jaa-huddle.netlify.app/",
    path: "/work/work-huddle.png",
    fallbackPath: "/thumb2.jpg",
  },
  {
    name: "Banksit",
    stack: "React App · Marketing Website · JWT",
    link: "https://banksit.netlify.app/",
    linkWebsite: "https://web-banksit.netlify.app/",
    github: "https://github.com/jaa-web-applications/banksit",
    githubWebsite: "https://github.com/jaa-web-applications/banksit-website",
    path: "/work/work-banksit-application.png",
    fallbackPath: "/thumb1.jpg",
  },
  {
    name: "Disease Discovery",
    stack: "Machine Learning · Classification",
    link: "https://github.com/machine-learning-solutions/disease_discovery",
    path: "/work/work-disease-discovery.png",
    fallbackPath: "/thumb1.jpg",
  },
  {
    name: "Data Visualization",
    stack: "Machine Learning · Data Viz",
    link: "https://github.com/machine-learning-solutions/data_visualisation",
    path: "/work/work-data-visualization.png",
    fallbackPath: "/thumb3.jpg",
  },
  {
    name: "House Price Regression",
    stack: "Machine Learning · Regression",
    link: "https://github.com/machine-learning-solutions/house_price_regression",
    path: "/work/work-house-price-regression.png",
    fallbackPath: "/thumb4.jpg",
  },
  {
    name: "City Explorer",
    stack: "Web App · Weather & Movies",
    link: "https://jadabuawwad-city-explorer.netlify.app/",
    path: "/work/work-city-explorer.png",
    fallbackPath: "/thumb1.jpg",
  },
];

export function getWorkSlides(chunkSize = 4) {
  const slides = [];
  for (let i = 0; i < workProjects.length; i += chunkSize) {
    slides.push({
      images: workProjects.slice(i, i + chunkSize).map((project) => ({
        ...project,
        label: getProjectLabel(project),
      })),
    });
  }
  return { slides };
}

export default workProjects;
