import Image from "next/image";
import { FaQuoteLeft } from "react-icons/fa";
import { Navigation, Pagination } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";

import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

const testimonialData = [
  {
    image: "/t-avt-1.png",
    name: "Hasan Armoush",
    position:
      "Lead Mobile Engineer | Swift & Flutter Engineer (Managed Jehad directly) · Oct 29, 2023",
    message:
      "Jehad is a very competitive, smart, resourceful developer and the amount of effort he's capable to put in day by day is just astonishing.",
  },
  {
    image: "/t-avt-2.png",
    name: "Omar Al-Nasier",
    position:
      "Lead Artificial Intelligence Engineer (Managed Jehad directly) · Dec 26, 2021",
    message:
      "Jehad is a fast-learner, a systematic person, and a so kind one. I managed Jehad for building machine learning projects for about 7 months. Regarding the model tuning, Jehad was the best in my Class. I highly recommend Jehad for all machine learning positions.",
  },
  {
    image: "/t-avt-3.png",
    name: "Faisal Kushha",
    position: "MPA | Data Analyst (Studied together) · Dec 26, 2021",
    message:
      "I worked with Jehad on two projects, he is a cooperative and reliable person. Additionally he showed a great skills in Machine Learning.",
  },
];

const TestimonialSlider = () => {
  return (
    <Swiper
      navigation
      pagination={{
        clickable: true,
      }}
      modules={[Navigation, Pagination]}
      className="h-[400px]"
    >
      {testimonialData.map((person, i) => (
        <SwiperSlide key={i}>
          <div className="flex flex-col items-center md:flex-row gap-x-8 h-full px-16">
            {/* avatar, name, position */}
            <div className="w-full max-w-[300px] flex flex-col xl:justify-center items-center relative mx-auto xl:mx-0">
              <div className="flex flex-col justify-center text-center">
                {/* avatar */}
                <div className="mb-2 mx-auto">
                  <Image
                    src={person.image}
                    width={100}
                    height={100}
                    alt={person.name}
                  />
                </div>

                {/* name */}
                <div className="text-lg">{person.name}</div>

                {/* position */}
                <div className="text-[12px] uppercase font-extralight tracking-widest">
                  {person.position}
                </div>
              </div>
            </div>

            {/* quote & message */}
            <div className="flex-1 flex flex-col justify-center before:w-[1px] xl:before:bg-white/20 xl:before:absolute xl:before:left-0 xl:before:h-[200px] relative xl:pl-20">
              {/* quote icon */}
              <div className="mb-4">
                <FaQuoteLeft
                  className="text-4xl xl:text-6xl text-white/20 mx-auto md:mx-0"
                  aria-hidden
                />
              </div>

              {/* message */}
              <div className="xl:text-lg text-center md:text-left">
                {person.message}
              </div>
            </div>
          </div>
        </SwiperSlide>
      ))}
    </Swiper>
  );
};

export default TestimonialSlider;
