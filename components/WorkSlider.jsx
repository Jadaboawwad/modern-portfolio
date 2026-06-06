import { useState } from "react";
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
  "relative z-50 touch-manipulation px-2 py-1 text-[10px] sm:text-[11px] font-bold uppercase tracking-wide bg-accent text-white rounded shadow-md hover:bg-accent/80 transition-colors";

const WorkSlider = () => {
  const [expandedCard, setExpandedCard] = useState(null);

  const toggleDescription = (cardKey) => {
    setExpandedCard((current) => (current === cardKey ? null : cardKey));
  };

  return (
    <Swiper
      spaceBetween={10}
      pagination={{
        clickable: true,
      }}
      modules={[Pagination]}
      className="h-[min(72vh,480px)] sm:h-[520px]"
    >
      {workSlides.slides.map((slide, i) => (
        <SwiperSlide key={i} className="!h-full">
          <div className="grid h-full min-h-0 grid-cols-2 grid-rows-2 gap-3 sm:gap-4">
            {slide.images.map((image, imageI) => {
              const cardKey = `${i}-${imageI}`;
              const isExpanded = expandedCard === cardKey;
              const isGithubOnly = image.link.includes("github.com");
              const hasLive = !isGithubOnly;
              const hasGithub = image.github && image.github !== image.link;
              const bottomLabel = getProjectLabel(image);
              const hideChrome = isExpanded;

              return (
                <div
                  className="flex min-h-0 flex-col overflow-hidden rounded-lg bg-black/40"
                  key={imageI}
                >
                  <div
                    role="button"
                    tabIndex={image.business ? 0 : undefined}
                    aria-expanded={image.business ? isExpanded : undefined}
                    aria-label={
                      image.business
                        ? `${image.name}. ${isExpanded ? "Hide" : "Show"} project description`
                        : image.name
                    }
                    onClick={(e) => {
                      if (!image.business) return;
                      if (e.target.closest("a")) return;
                      toggleDescription(cardKey);
                    }}
                    onKeyDown={(e) => {
                      if (!image.business) return;
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        toggleDescription(cardKey);
                      }
                    }}
                    className={`group/card relative min-h-0 flex-1 touch-manipulation ${
                      image.business ? "cursor-pointer" : ""
                    }`}
                  >
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

                    {/* business — hover / tap overlay */}
                    {image.business && (
                      <div
                        className={`pointer-events-none absolute inset-0 z-40 flex bg-black/92 transition-opacity duration-300 backdrop-blur-sm max-md:items-start max-md:justify-start max-md:px-3.5 max-md:pt-3 max-md:pb-4 md:items-center md:justify-center md:px-5 md:py-8 ${
                          isExpanded
                            ? "opacity-100"
                            : "opacity-0 [@media(hover:hover)]:group-hover/card:opacity-100"
                        }`}
                      >
                        <p
                          className={`max-h-full w-full overflow-y-auto overscroll-contain font-medium text-white max-md:text-left max-md:text-[10px] max-md:leading-[1.65] max-md:pr-1 sm:text-xs sm:leading-relaxed md:text-center ${
                            isExpanded ? "max-md:line-clamp-none" : ""
                          }`}
                        >
                          {image.business}
                        </p>
                      </div>
                    )}

                    {/* project name — top left */}
                    <div
                      className={`absolute top-0 left-0 z-30 max-w-[70%] rounded-br-md bg-black/80 px-2.5 py-2 backdrop-blur-sm transition-opacity duration-300 ${
                        hideChrome
                          ? "max-md:invisible max-md:opacity-0"
                          : "opacity-100 [@media(hover:hover)]:group-hover/card:opacity-0"
                      }`}
                    >
                      <p className="text-left text-[10px] font-bold leading-tight text-white sm:text-xs">
                        {image.name}
                      </p>
                    </div>

                    {/* links — always tappable; stay above hover overlay */}
                    <div
                      className={`absolute top-2 right-2 z-50 flex max-w-[48%] flex-row flex-wrap justify-end gap-1 ${
                        hideChrome
                          ? "pointer-events-none max-md:invisible max-md:opacity-0"
                          : "opacity-100"
                      }`}
                    >
                      {hasLive && (
                        <Link
                          href={image.link}
                          target="_blank"
                          rel="noreferrer noopener"
                          className={linkButtonClass}
                          onClick={(e) => e.stopPropagation()}
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
                          onClick={(e) => e.stopPropagation()}
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
                          onClick={(e) => e.stopPropagation()}
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
                          onClick={(e) => e.stopPropagation()}
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
                          onClick={(e) => e.stopPropagation()}
                        >
                          <BsGithub aria-hidden />
                          Web
                        </Link>
                      )}
                    </div>
                  </div>

                  {/* stack / label — fixed strip below image; hide on mobile when description is open */}
                  <div
                    className={`shrink-0 border-t border-white/10 bg-black/90 px-2.5 py-2 backdrop-blur-sm transition-opacity duration-300 ${
                      isExpanded ? "max-md:invisible max-md:h-0 max-md:overflow-hidden max-md:border-0 max-md:py-0" : ""
                    }`}
                  >
                    <p className="line-clamp-2 text-left text-[9px] font-medium leading-snug text-white/90 sm:text-[10px]">
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
