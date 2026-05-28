/**
 * Projects from portfolio/src/views/examples/Landing.js
 * name = project title (top-left)
 * stack = tech / type (bottom-left)
 * link = Live or GitHub; github / githubBackend when both exist
 */

const workProjects = [
  {
    name: "Disease Discovery",
    stack: "Machine Learning · Classification",
    link: "https://github.com/machine-learning-solutions/disease_discovery",
    path: "/work/work-disease-discovery.png",
    fallbackPath: "/thumb1.jpg",
  },
  {
    name: "People Thinks",
    stack: "Deep Learning · NLP",
    link: "https://github.com/machine-learning-solutions/people_thinks",
    path: "/work/work-people-thinks.png",
    fallbackPath: "/thumb2.jpg",
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
    name: "Game of Greed",
    stack: "Python · CLI Game",
    link: "https://github.com/jaa-games/game_of_greed",
    path: "/work/work-game-of-greed.png",
    fallbackPath: "/thumb4.jpg",
  },
  {
    name: "City Explorer",
    stack: "Web App · Weather & Movies",
    link: "https://jadabuawwad-city-explorer.netlify.app/",
    path: "/work/work-city-explorer.png",
    fallbackPath: "/thumb1.jpg",
  },
  {
    name: "Can Of Books",
    stack: "React · Mongoose · Auth0",
    link: "https://jadabuawwad-can-of-books.netlify.app/",
    path: "/work/work-can-of-books.png",
    fallbackPath: "/thumb2.jpg",
  },
  {
    name: "Flowers Club",
    stack: "Web App · Auth0 · MVC",
    link: "https://jadabuawwad-flowers.netlify.app/",
    path: "/work/work-flowers-club.png",
    fallbackPath: "/thumb3.jpg",
  },
  {
    name: "Photo Gallery",
    stack: "React · Mongoose · Auth0",
    link: "https://jadabuawwad-photo-gallery.netlify.app/",
    path: "/work/work-photo-gallery.png",
    fallbackPath: "/thumb1.jpg",
  },
  {
    name: "Huddle",
    stack: "Next.js · Styled Components",
    link: "https://jaa-huddle.netlify.app/",
    path: "/work/work-huddle.png",
    fallbackPath: "/thumb2.jpg",
  },
  {
    name: "Country Quiz",
    stack: "Next.js · Quiz App",
    link: "https://jaa-country-quiz.netlify.app/",
    path: "/work/work-country-quiz.png",
    fallbackPath: "/thumb3.jpg",
  },
  {
    name: "Conduit",
    stack: "React · Redux · JWT",
    link: "https://conduit-application.netlify.app/",
    github: "https://github.com/jaa-web-applications/conduit",
    path: "/work/work-conduit.png",
    fallbackPath: "/thumb4.jpg",
  },
  {
    name: "Done With It",
    stack: "React Native · Mobile",
    link: "https://github.com/jaa-web-applications/done_with_it",
    path: "/work/work-done-with-it.png",
    fallbackPath: "/thumb4.jpg",
  },
  {
    name: "Banksit Application",
    stack: "React · Redux · JWT",
    link: "https://banksit.netlify.app/",
    github: "https://github.com/jaa-web-applications/banksit",
    path: "/work/work-banksit-application.png",
    fallbackPath: "/thumb1.jpg",
  },
  {
    name: "Banksit Website",
    stack: "HTML · CSS · JavaScript",
    link: "https://web-banksit.netlify.app/",
    github: "https://github.com/jaa-web-applications/banksit-website",
    path: "/work/work-banksit-website.png",
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
    name: "AIMedica",
    stack: "ML Classification · Web App",
    link: "https://we-medica.vercel.app/",
    github: "https://github.com/SuperbaTeam/ai-medica-front-end",
    githubBackend: "https://github.com/SuperbaTeam/ai-medica-back-end",
    path: "/work/work-aimedica.png",
    fallbackPath: "/thumb2.jpg",
  },
];

export function getWorkSlides(chunkSize = 4) {
  const slides = [];
  for (let i = 0; i < workProjects.length; i += chunkSize) {
    slides.push({ images: workProjects.slice(i, i + chunkSize) });
  }
  return { slides };
}

export default workProjects;
