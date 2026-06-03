/**
 * Projects from portfolio/src/views/examples/Landing.js
 * name = project title (top-left)
 * business = short business purpose (hover overlay on /work)
 * stack / label = tech / type (bottom bar); label falls back to stack in the slider
 * link = Live or GitHub; github / githubBackend when both exist
 */

export function getProjectLabel(project) {
  return project.label || project.stack || "";
}

const workProjects = [
  {
    name: "WeFix",
    business:
      "B2B and B2C field-service platform—book repairs, manage tickets, and dispatch technicians.",
    stack: "Flutter · React OMS · Node · GraphQL · B2B/B2C",
    link: "https://wefix-system.com/",
    path: "/work/work-wefix.png",
    fallbackPath: "/thumb1.jpg",
  },
  {
    name: "Nuqayyem",
    business:
      "HTU classroom assessment—self, peer, and instructor feedback for lessons and homework.",
    stack: "Flutter · GraphQL · Formative Assessment · HTU",
    link: "https://github.com/nuqayyem-application/nuqayyem",
    githubBackend: "https://github.com/nuqayyem-application/backend",
    path: "/work/work-nuqayyem.png",
    fallbackPath: "/thumb2.jpg",
  },
  {
    name: "Blinx",
    business:
      "MENA media hub for original storytelling and short-form video across mobile and TV.",
    stack: "Flutter · Firebase · Chromecast · Apple TV · MENA",
    link: "https://blinx.com/",
    path: "/work/work-blinx.png",
    fallbackPath: "/thumb3.jpg",
  },
  {
    name: "ReStaged",
    business:
      "Furniture marketplace to rent or buy pre-owned pieces for home staging and moves.",
    stack: "TypeScript · Mobile · Furniture Rent & Sell",
    link: "https://restaged.com/",
    path: "/work/work-restaged.png",
    fallbackPath: "/thumb4.jpg",
  },
  {
    name: "WeMedica",
    business:
      "Medical screening assistant—patients and doctors check lab results for disease risk.",
    stack: "ML Classification · Web App",
    link: "https://wemedica.netlify.app/",
    github: "https://github.com/SuperbaTeam/ai-medica-front-end",
    githubBackend: "https://github.com/SuperbaTeam/ai-medica-back-end",
    path: "/work/work-aimedica.png",
    fallbackPath: "/thumb2.jpg",
  },
  {
    name: "People Thinks",
    business:
      "NLP study of Jordanian social sentiment during the 2022 universal closure period.",
    stack: "Deep Learning · NLP",
    link: "https://github.com/machine-learning-solutions/people_thinks",
    path: "/work/work-people-thinks.png",
    fallbackPath: "/thumb2.jpg",
  },
  {
    name: "SeAssis",
    business:
      "Jordan on-demand help—roadside, fuel, food, and home services when you are stuck.",
    stack: "Web App · NLP",
    link: "https://seassis.netlify.app/",
    github: "https://github.com/jaa-web-applications/seassis",
    githubBackend: "https://github.com/jaa-web-applications/seassis-backend",
    path: "/work/work-seassis.png",
    fallbackPath: "/thumb3.jpg",
  },
  {
    name: "PyArcade Games",
    business: "Terminal arcade games collection built while learning Python.",
    stack: "Python · CLI Games",
    link: "https://github.com/jaa-games/pyarcade_games",
    path: "/work/work-pyarcade-games.png",
    fallbackPath: "/thumb1.jpg",
  },
  {
    name: "Game of Greed",
    business: "Dice scoring game—first to 10,000 points wins.",
    stack: "Python · CLI Game",
    link: "https://github.com/jaa-games/game_of_greed",
    path: "/work/work-game-of-greed.png",
    fallbackPath: "/thumb4.jpg",
  },
  {
    name: "Country Quiz",
    business: "Geography quiz to test what you know about countries worldwide.",
    stack: "Next.js · Quiz App",
    link: "https://jaa-country-quiz.netlify.app/",
    path: "/work/work-country-quiz.png",
    fallbackPath: "/thumb3.jpg",
  },
  {
    name: "Huddle",
    business: "Online community landing page for people who want to connect.",
    stack: "Next.js · Styled Components",
    link: "https://jaa-huddle.netlify.app/",
    path: "/work/work-huddle.png",
    fallbackPath: "/thumb2.jpg",
  },
  {
    name: "Banksit",
    business:
      "Demo digital bank—transfers, loans, and account tools plus a marketing site.",
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
    business:
      "ML models that screen hepatitis and stroke risk from patient health data.",
    stack: "Machine Learning · Classification",
    link: "https://github.com/machine-learning-solutions/disease_discovery",
    path: "/work/work-disease-discovery.png",
    fallbackPath: "/thumb1.jpg",
  },
  {
    name: "Data Visualization",
    business:
      "Exploratory analytics and charts from cleaned datasets for insight reporting.",
    stack: "Machine Learning · Data Viz",
    link: "https://github.com/machine-learning-solutions/data_visualisation",
    path: "/work/work-data-visualization.png",
    fallbackPath: "/thumb3.jpg",
  },
  {
    name: "House Price Regression",
    business:
      "Predicts property prices from housing features for real-estate market analysis.",
    stack: "Machine Learning · Regression",
    link: "https://github.com/machine-learning-solutions/house_price_regression",
    path: "/work/work-house-price-regression.png",
    fallbackPath: "/thumb4.jpg",
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
