import Head from "next/head";

import Header from "../components/Header";
import Nav from "../components/Nav";
import TopLeftImg from "../components/TopLeftImg";
import WhatsAppFloat from "../components/WhatsAppFloat";

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
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
      </Head>

      <TopLeftImg />
      <Nav />
      <Header />
      <WhatsAppFloat />

      {/* main content */}
      {children}
    </main>
  );
};

export default Layout;
