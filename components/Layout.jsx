import Head from "next/head";

import Header from "../components/Header";
import Nav from "../components/Nav";
import TopLeftImg from "../components/TopLeftImg";

const Layout = ({ children }) => {
  return (
    <main
      className="page bg-site text-white bg-cover bg-no-repeat font-sora relative"
    >
      {/* metadata */}
      <Head>
        <title>Jehad Abu Awwad | Portfolio</title>
        <meta
          name="description"
          content="Jehad Abu Awwad — Software & Mechatronics Engineer specializing in AI, web, and mobile."
        />
        <meta
          name="keywords"
          content="react, next, nextjs, html, css, javascript, js, modern-ui, modern-ux, portfolio, framer-motion, 3d-website, particle-effect"
        />
        <meta name="author" content="Jehad Abu Awwad" />
        <meta name="theme-color" content="#f13024" />
      </Head>

      <TopLeftImg />
      <Nav />
      <Header />

      {/* main content */}
      {children}
    </main>
  );
};

export default Layout;
