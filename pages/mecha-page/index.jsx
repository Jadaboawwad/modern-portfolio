import { motion } from "framer-motion";
import Image from "next/image";

import Bulb from "../../components/Bulb";
import Circles from "../../components/Circles";
import { mechaIntro, mechaProjects } from "../../data/mechaProjects";
import { fadeIn } from "../../variants";

const MechaProject = ({ project, index }) => {
  const imageBlock = (
    <motion.div
      variants={fadeIn(project.imageFirst ? "right" : "left", 0.3)}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount: 0.3 }}
      className="relative flex-1 w-full max-w-[520px] mx-auto xl:max-w-none"
    >
      <div className="relative aspect-[4/3] rounded-2xl overflow-hidden border border-white/10 bg-white/5">
        <Image
          src={project.image}
          alt={project.imageAlt}
          fill
          className="object-cover"
          sizes="(max-width: 1280px) 100vw, 520px"
        />
      </div>
    </motion.div>
  );

  const textBlock = (
    <motion.div
      variants={fadeIn(project.imageFirst ? "left" : "right", 0.4)}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount: 0.3 }}
      className="flex-1 flex flex-col justify-center text-center xl:text-left"
    >
      <h3 className="text-2xl md:text-3xl font-semibold text-white mb-4">
        {project.title}
      </h3>
      <p className="max-w-[560px] mx-auto xl:mx-0">{project.description}</p>
    </motion.div>
  );

  return (
    <section
      className={`flex flex-col gap-10 xl:gap-16 items-center ${
        index > 0 ? "mt-16 xl:mt-24" : ""
      } ${project.imageFirst ? "xl:flex-row" : "xl:flex-row-reverse"}`}
    >
      {imageBlock}
      {textBlock}
    </section>
  );
};

const MechaPage = () => {
  return (
    <div className="h-full bg-primary/30 overflow-y-auto overflow-x-hidden scrollbar-hide">
      <Circles />
      <div className="container mx-auto px-4 py-32 xl:py-36 min-h-full">
        {/* hero */}
        <div className="text-center xl:text-left max-w-[900px] mx-auto xl:mx-0 mb-16 xl:mb-20">
          <motion.h2
            variants={fadeIn("up", 0.2)}
            initial="hidden"
            animate="show"
            exit="hidden"
            className="h2"
          >
            {mechaIntro.title}{" "}
            <span className="text-accent">{mechaIntro.titleAccent}</span>.
          </motion.h2>
          <motion.p
            variants={fadeIn("up", 0.35)}
            initial="hidden"
            animate="show"
            exit="hidden"
            className="mb-8 max-w-[800px] mx-auto xl:mx-0"
          >
            {mechaIntro.description}
          </motion.p>
          <motion.p
            variants={fadeIn("up", 0.5)}
            initial="hidden"
            animate="show"
            exit="hidden"
            className="text-lg md:text-xl text-white/80 font-light max-w-[760px] mx-auto xl:mx-0"
          >
            {mechaIntro.subtitle}
          </motion.p>
        </div>

        {/* projects */}
        <div className="max-w-6xl mx-auto pb-12">
          {mechaProjects.map((project, index) => (
            <MechaProject key={project.title} project={project} index={index} />
          ))}
        </div>
      </div>
      <Bulb />
    </div>
  );
};

export default MechaPage;
