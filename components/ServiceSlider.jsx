import {
  RxCrop,
  RxPencil2,
  RxDesktop,
  RxReader,
  RxRocket,
  RxArrowTopRight,
} from "react-icons/rx";
import { FreeMode, Pagination } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";

import "swiper/css";
import "swiper/css/free-mode";
import "swiper/css/pagination";

const serviceData = [
  {
    Icon: RxCrop,
    title: "Full‑Stack Platforms",
    description:
      "B2B/B2C systems with Node.js/TypeScript backends (REST/GraphQL), secure auth, databases & migrations, and scalable architecture.",
  },
  {
    Icon: RxPencil2,
    title: "Mobile Apps (Flutter)",
    description:
      "Cross‑platform apps for end users & technicians: BLoC/Clean Architecture, maps, OTP flows, localization (RTL/Arabic), and real‑time features.",
  },
  {
    Icon: RxDesktop,
    title: "Web Dashboards",
    description:
      "React/TypeScript admin portals with Atomic Design, Redux Toolkit, role‑based access, and multilingual UI for operational workflows.",
  },
  {
    Icon: RxReader,
    title: "AI / ML Solutions",
    description:
      "Applied ML for classification, regression, and clustering, NLP chatbots, and extraction pipelines (prompting + RAG) for real business data.",
  },
  {
    Icon: RxRocket,
    title: "DevOps & Delivery",
    description:
      "Docker & Compose, CI/CD on Linux, deployments behind nginx + SSL, monitoring-friendly service setups, and automated migrations/testing.",
  },
];

const ServiceSlider = () => {
  return (
    <Swiper
      breakpoints={{
        320: {
          slidesPerView: 1,
          spaceBetween: 15,
        },
        640: {
          slidesPerView: 3,
          spaceBetween: 15,
        },
      }}
      pagination={{
        clickable: true,
      }}
      modules={[FreeMode, Pagination]}
      freeMode
      className="!h-auto min-h-[240px] sm:min-h-[340px]"
    >
      {serviceData.map((item, i) => (
        <SwiperSlide key={i} className="!h-auto">
          <div className="bg-[rgba(65,47,123,0.15)] h-full min-h-0 w-full rounded-lg px-6 py-8 flex sm:flex-col gap-x-6 sm:gap-x-0 group cursor-pointer hover:bg-[rgba(89,65,169,0.15)] transition-all duration-300 overflow-hidden">
            {/* icon */}
            <div className="shrink-0 text-4xl text-accent mb-4">
              <item.Icon aria-hidden />
            </div>

            {/* title & description */}
            <div className="min-w-0 flex-1 mb-8">
              <div className="mb-2 text-lg">{item.title}</div>
              <p className="w-full leading-normal break-words [overflow-wrap:anywhere]">
                {item.description}
              </p>
            </div>

            {/* arrow */}
            <div className="shrink-0 text-3xl">
              <RxArrowTopRight
                className="group-hover:rotate-45 group-hover:text-accent transition-all duration-300"
                aria-hidden
              />
            </div>
          </div>
        </SwiperSlide>
      ))}
    </Swiper>
  );
};

export default ServiceSlider;
