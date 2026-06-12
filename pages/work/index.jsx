import { motion } from "framer-motion";

import Bulb from "../../components/Bulb";
import Circles from "../../components/Circles";
import WorkSlider from "../../components/WorkSlider";
import { fadeIn } from "../../variants";

const Work = () => {
  return (
    <div className="flex min-h-full items-center justify-center bg-primary/30 pb-28 pt-4 max-xl:overflow-y-auto xl:h-full xl:py-36">
      <Circles />
      <div className="container mx-auto px-4 sm:px-[15px]">
        <div className="flex flex-col items-center gap-y-6 xl:flex-row xl:items-center xl:gap-x-8">
          {/* text */}
          <div className="flex w-full max-w-[400px] flex-col text-center xl:w-[30vw] xl:max-w-none xl:text-left">
            <motion.h2
              variants={fadeIn("up", 0.2)}
              initial="hidden"
              animate="show"
              exit="hidden"
              className="h2 xl:mt-12"
            >
              My work <span className="text-accent">.</span>
            </motion.h2>
            <motion.p
              variants={fadeIn("up", 0.4)}
              initial="hidden"
              animate="show"
              exit="hidden"
              className="mb-4 mx-auto xl:mx-0"
            >
              A selection of my projects across AI/ML, web apps, and mobile apps
              (including live deployments and open-source repositories).
            </motion.p>
          </div>

          {/* slider */}
          <motion.div
            variants={fadeIn("down", 0.6)}
            initial="hidden"
            animate="show"
            exit="hidden"
            className="flex w-full max-w-[560px] justify-center pr-12 sm:max-w-[600px] sm:pr-14 xl:max-w-[65%] xl:pr-0"
          >
            <WorkSlider />
          </motion.div>
        </div>
      </div>
      <Bulb />
    </div>
  );
};

export default Work;
