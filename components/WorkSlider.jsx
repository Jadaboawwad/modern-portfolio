import Image from "next/image";
import Link from "next/link";
import { BsGithub } from "react-icons/bs";
import { Pagination } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";

import { getWorkSlides } from "../data/workProjects";

import "swiper/css";
import "swiper/css/free-mode";
import "swiper/css/pagination";

const workSlides = getWorkSlides(4);

const linkButtonClass =
  "px-2 py-1 text-[10px] sm:text-[11px] font-bold uppercase tracking-wide bg-accent text-white rounded shadow-md hover:bg-accent/80 transition-colors";

const WorkSlider = () => {
  return (
    <Swiper
      spaceBetween={10}
      pagination={{
        clickable: true,
      }}
      modules={[Pagination]}
      className="h-[280px] sm:h-[480px]"
    >
      {workSlides.slides.map((slide, i) => (
        <SwiperSlide key={i}>
          <div className="grid grid-cols-2 grid-rows-2 gap-4">
            {slide.images.map((image, imageI) => {
              const isGithubOnly = image.link.includes("github.com");
              const hasLive = !isGithubOnly;
              const hasGithub = image.github && image.github !== image.link;

              return (
                <div
                  className="relative rounded-lg overflow-hidden group"
                  key={imageI}
                >
                  <div className="relative w-full h-full min-h-[120px] sm:min-h-[200px]">
                    <Image
                      src={image.path}
                      alt={image.name}
                      width={500}
                      height={300}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        if (image.fallbackPath) {
                          e.currentTarget.src = image.fallbackPath;
                        }
                      }}
                    />

                    {/* project name — top left */}
                    <div className="absolute top-0 left-0 z-20 max-w-[70%] px-2 py-1.5 bg-black/75 backdrop-blur-sm rounded-br-md">
                      <p className="text-[10px] sm:text-xs font-bold text-white leading-tight text-left">
                        {image.name}
                      </p>
                    </div>

                    {/* stack — bottom left */}
                    {image.stack && (
                      <div className="absolute bottom-0 left-0 z-20 max-w-[75%] px-2 py-1.5 bg-black/75 backdrop-blur-sm rounded-tr-md">
                        <p className="text-[9px] sm:text-[10px] font-medium text-white/90 leading-tight text-left">
                          {image.stack}
                        </p>
                      </div>
                    )}

                    {/* links — top right, always visible */}
                    <div className="absolute top-1.5 right-1.5 z-30 flex flex-col items-end gap-1">
                      {hasLive && (
                        <Link
                          href={image.link}
                          target="_blank"
                          rel="noreferrer noopener"
                          className={linkButtonClass}
                        >
                          Live
                        </Link>
                      )}
                      {(isGithubOnly || hasGithub) && (
                        <Link
                          href={hasGithub ? image.github : image.link}
                          target="_blank"
                          rel="noreferrer noopener"
                          className={`${linkButtonClass} flex items-center gap-1`}
                          aria-label={`${image.name} on GitHub`}
                        >
                          <BsGithub aria-hidden />
                          GitHub
                        </Link>
                      )}
                      {image.githubBackend && (
                        <Link
                          href={image.githubBackend}
                          target="_blank"
                          rel="noreferrer noopener"
                          className={`${linkButtonClass} flex items-center gap-1`}
                          aria-label={`${image.name} backend on GitHub`}
                        >
                          <BsGithub aria-hidden />
                          Backend
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </SwiperSlide>
      ))}
    </Swiper>
  );
};

export default WorkSlider;
