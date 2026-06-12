import { motion } from "framer-motion";

import TestimonialSlider from "../../components/TestimonialSlider";
import { fadeIn } from "../../variants";

const Testimonials = () => {
  return (
    <div className="min-h-full bg-primary/30 pb-28 pt-4 text-center max-xl:overflow-y-auto xl:h-full xl:py-32">
      <div className="container mx-auto flex flex-col xl:h-full xl:justify-center">
        <motion.h2
          variants={fadeIn("up", 0.2)}
          initial="hidden"
          animate="show"
          exit="hidden"
          className="h2 mb-8 xl:mb-0"
        >
          Recommendations <span className="text-accent">.</span>
        </motion.h2>

        {/* slider */}
        <motion.div
          variants={fadeIn("up", 0.4)}
          initial="hidden"
          animate="show"
          exit="hidden"
        >
          <TestimonialSlider />
        </motion.div>
      </div>
    </div>
  );
};

export default Testimonials;
