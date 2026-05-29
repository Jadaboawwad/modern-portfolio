import Image from "next/image";
import Link from "next/link";
import { BsGithub } from "react-icons/bs";
import { Pagination } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";

import { getProjectLabel, getWorkSlides } from "../data/workProjects";

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
              const bottomLabel = getProjectLabel(image);

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
                    <div className="absolute top-0 left-0 z-30 max-w-[55%] sm:max-w-[60%] px-2 py-1.5 bg-black/80 backdrop-blur-sm rounded-br-md">
                      <p className="text-[10px] sm:text-xs font-bold text-white leading-tight text-left">
                        {image.name}
                      </p>
                    </div>

                    {/* links — below title, compact row so they do not cover the bottom label */}
                    <div className="absolute top-8 sm:top-9 right-1.5 z-30 flex flex-row flex-wrap justify-end gap-1 max-w-[42%] sm:max-w-[48%]">
                      {hasLive && (
                        <Link
                          href={image.link}
                          target="_blank"
                          rel="noreferrer noopener"
                          className={linkButtonClass}
                        >
                          {image.linkWebsite ? "App" : "Live"}
                        </Link>
                      )}
                      {image.linkWebsite && (
                        <Link
                          href={image.linkWebsite}
                          target="_blank"
                          rel="noreferrer noopener"
                          className={linkButtonClass}
                        >
                          Web
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
                          {image.githubWebsite ? "App" : "GitHub"}
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
                      {image.githubWebsite && (
                        <Link
                          href={image.githubWebsite}
                          target="_blank"
                          rel="noreferrer noopener"
                          className={`${linkButtonClass} flex items-center gap-1`}
                          aria-label={`${image.name} website on GitHub`}
                        >
                          <BsGithub aria-hidden />
                          Web
                        </Link>
                      )}
                    </div>

                    {/* stack / label — full-width bottom bar, always visible */}
                    {bottomLabel ? (
                      <div className="absolute inset-x-0 bottom-0 z-40 px-2 py-1.5 bg-black/85 backdrop-blur-sm border-t border-white/10">
                        <p className="text-[9px] sm:text-[10px] font-medium text-white/90 leading-snug text-left line-clamp-2">
                          {bottomLabel}
                        </p>
                      </div>
                    ) : null}
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
