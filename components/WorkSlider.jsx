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
      className="h-[320px] sm:h-[520px]"
    >
      {workSlides.slides.map((slide, i) => (
        <SwiperSlide key={i} className="!h-full">
          <div className="grid h-full min-h-0 grid-cols-2 grid-rows-2 gap-3 sm:gap-4">
            {slide.images.map((image, imageI) => {
              const isGithubOnly = image.link.includes("github.com");
              const hasLive = !isGithubOnly;
              const hasGithub = image.github && image.github !== image.link;
              const bottomLabel = getProjectLabel(image);

              return (
                <div
                  className="flex min-h-0 flex-col overflow-hidden rounded-lg bg-black/40 group"
                  key={imageI}
                >
                  <div className="relative min-h-0 flex-1">
                    <Image
                      src={image.path}
                      alt={image.name}
                      fill
                      sizes="(max-width: 640px) 45vw, 280px"
                      className="object-cover"
                      onError={(e) => {
                        if (image.fallbackPath) {
                          e.currentTarget.src = image.fallbackPath;
                        }
                      }}
                    />

                    {/* business — hover overlay */}
                    {image.business && (
                      <div
                        className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center bg-black/85 px-3 py-6 opacity-0 backdrop-blur-sm transition-opacity duration-300 group-hover:opacity-100"
                        aria-hidden
                      >
                        <p className="text-center text-[10px] font-medium leading-snug text-white sm:text-xs">
                          {image.business}
                        </p>
                      </div>
                    )}

                    {/* project name — top left */}
                    <div className="absolute top-0 left-0 z-30 max-w-[55%] sm:max-w-[60%] px-2 py-1.5 bg-black/80 backdrop-blur-sm rounded-br-md">
                      <p className="text-[10px] sm:text-xs font-bold text-white leading-tight text-left">
                        {image.name}
                      </p>
                    </div>

                    {/* links — below title */}
                    <div className="absolute top-8 sm:top-9 right-1.5 z-30 flex max-w-[42%] flex-row flex-wrap justify-end gap-1 sm:max-w-[48%]">
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
                  </div>

                  {/* stack / label — fixed strip below image (never clipped by cover) */}
                  <div className="shrink-0 border-t border-white/10 bg-black/90 px-2 py-1.5 backdrop-blur-sm">
                    <p className="text-[9px] font-medium leading-snug text-white/90 sm:text-[10px] line-clamp-2 text-left">
                      {bottomLabel || "Portfolio project"}
                    </p>
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
