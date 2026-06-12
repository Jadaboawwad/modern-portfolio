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
      autoHeight
      navigation
      pagination={{
        clickable: true,
      }}
      modules={[Navigation, Pagination]}
      className="min-h-[480px] pb-12 sm:min-h-[520px] md:min-h-[560px]"
    >
      {testimonialData.map((person, i) => (
        <SwiperSlide key={i} className="!h-auto">
          <div className="flex flex-col items-center gap-y-6 px-4 py-4 sm:px-8 md:flex-row md:items-start md:gap-x-8 md:py-6 xl:px-16">
            {/* avatar, name, position */}
            <div className="flex w-full max-w-[300px] shrink-0 flex-col items-center relative mx-auto md:pt-2 xl:mx-0">
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
            <div className="relative flex min-h-[12rem] w-full flex-1 flex-col justify-start md:min-h-[14rem] xl:pl-20 xl:before:absolute xl:before:left-0 xl:before:h-full xl:before:w-[1px] xl:before:bg-white/20">
              {/* quote icon */}
              <div className="mb-4 shrink-0">
                <FaQuoteLeft
                  className="mx-auto text-4xl text-white/20 md:mx-0 xl:text-6xl"
                  aria-hidden
                />
              </div>

              {/* message */}
              <div className="min-h-[8rem] text-center text-base leading-[1.85] text-white/85 md:text-left md:text-[17px] xl:text-lg">
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
