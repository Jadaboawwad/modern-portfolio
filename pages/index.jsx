import { motion } from "framer-motion";
import Image from "next/image";

import ParticlesContainer from "../components/ParticlesContainer";
import ProjectsBtn from "../components/ProjectsBtn";
import Avatar from "../components/Avatar";

import { fadeIn } from "../variants";

const Home = () => {
  return (
    <div className="bg-primary/60 h-full">
      {/* text */}
      <div className="relative z-10 w-full h-full bg-gradient-to-r from-primary/10 via-black/30 to-black/10">
        <div className="text-center flex flex-col justify-start max-xl:pt-2 xl:justify-center xl:pt-40 xl:text-left h-full container mx-auto px-4 pb-6 xl:pb-0">
          {/* title */}
          <motion.h1
            variants={fadeIn("down", 0.2)}
            initial="hidden"
            animate="show"
            exit="hidden"
            className="h1"
          >
            Jehad Abu Awwad <br />{" "}
            <span className="text-accent">AI · Web · Mobile</span>
          </motion.h1>

          {/* subtitle */}
          <motion.p
            variants={fadeIn("down", 0.3)}
            initial="hidden"
            animate="show"
            exit="hidden"
            className="max-w-[260px] sm:max-w-sm xl:max-w-xl mx-auto xl:mx-0 mb-3 xl:mb-16 text-xs leading-relaxed xl:text-base xl:leading-[1.8]"
          >
            Software &amp; Mechatronics Engineer based in Amman, Jordan — building
            full-stack platforms, cross-platform mobile apps, and intelligent
            automation systems.
          </motion.p>

          {/* mobile/tablet portrait */}
          <motion.div
            variants={fadeIn("up", 0.5)}
            initial="hidden"
            animate="show"
            exit="hidden"
            transition={{ duration: 1, ease: "easeInOut" }}
            className="relative z-10 mx-auto mb-3 w-[140px] sm:w-[170px] xl:hidden"
          >
            <Image
              src="/avatar.png"
              alt="Jehad Abu Awwad"
              width={737}
              height={678}
              priority
              className="h-auto w-full pointer-events-none select-none"
            />
          </motion.div>

          {/* btn */}
          <div className="relative z-20 flex justify-center xl:hidden">
            <ProjectsBtn />
          </div>
          <motion.div
            variants={fadeIn("down", 0.4)}
            initial="hidden"
            animate="show"
            exit="hidden"
            className="hidden xl:flex"
          >
            <ProjectsBtn />
          </motion.div>
        </div>
      </div>
      {/* image */}
      <div className="pointer-events-none w-[1280px] h-full absolute right-0 bottom-0 z-0">
        {/* bg img */}
        <div
          role="img"
          className="bg-none xl:bg-explosion xl:bg-cover xl:bg-right xl:bg-no-repeat w-full h-full absolute mix-blend-color-dodge translate-z-0"
          aria-hidden
        />

        {/* particles */}
        <ParticlesContainer />

        {/* avatar */}
        <motion.div
          variants={fadeIn("up", 0.5)}
          initial="hidden"
          animate="show"
          exit="hidden"
          transition={{ duration: 1, ease: "easeInOut" }}
          className="w-full h-full max-w-[737px] max-h-[678px] absolute -bottom-32 lg:bottom-0 lg:right-[8%]"
        >
          <Avatar />
        </motion.div>
      </div>
    </div>
  );
};

export default Home;
