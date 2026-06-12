import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { BsGithub } from "react-icons/bs";
import { Pagination } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";

import { getProjectLabel, getWorkSlides } from "../data/workProjects";

import "swiper/css";
import "swiper/css/free-mode";
import "swiper/css/pagination";

const MOBILE_CHUNK = 1;
const DESKTOP_CHUNK = 4;
const MOBILE_BREAKPOINT = 640;

const linkButtonClass =
  "relative z-50 touch-manipulation px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide bg-accent text-white rounded shadow-md hover:bg-accent/80 transition-colors sm:text-[11px]";

const WorkSlider = () => {
  const [expandedCard, setExpandedCard] = useState(null);
  const [chunkSize, setChunkSize] = useState(DESKTOP_CHUNK);

  useEffect(() => {
    const updateChunkSize = () => {
      setChunkSize(
        window.innerWidth < MOBILE_BREAKPOINT ? MOBILE_CHUNK : DESKTOP_CHUNK
      );
    };

    updateChunkSize();
    window.addEventListener("resize", updateChunkSize);
    return () => window.removeEventListener("resize", updateChunkSize);
  }, []);

  const workSlides = useMemo(() => getWorkSlides(chunkSize), [chunkSize]);
  const isMobileLayout = chunkSize === MOBILE_CHUNK;

  const toggleDescription = (cardKey) => {
    setExpandedCard((current) => (current === cardKey ? null : cardKey));
  };

  return (
    <Swiper
      key={chunkSize}
      autoHeight={isMobileLayout}
      spaceBetween={10}
      pagination={{
        clickable: true,
      }}
      modules={[Pagination]}
      className={
        isMobileLayout
          ? "w-full pb-10"
          : "h-[320px] w-full sm:h-[520px]"
      }
    >
      {workSlides.slides.map((slide, i) => (
        <SwiperSlide key={i} className={isMobileLayout ? "!h-auto" : "!h-full"}>
          <div
            className={`grid w-full gap-3 sm:gap-4 ${
              isMobileLayout
                ? "grid-cols-1"
                : "h-full min-h-0 grid-cols-2 grid-rows-2"
            }`}
          >
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
                  className={`flex flex-col overflow-hidden rounded-lg bg-black/40 ${
                    isMobileLayout ? "w-full" : "min-h-0"
                  }`}
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
                    className={`group/card relative w-full touch-manipulation ${
                      isMobileLayout
                        ? "aspect-[16/10] min-h-[200px]"
                        : "min-h-0 flex-1"
                    } ${image.business ? "cursor-pointer" : ""}`}
                  >
                    <Image
                      src={image.path}
                      alt={image.name}
                      fill
                      sizes={
                        isMobileLayout
                          ? "100vw"
                          : "(max-width: 640px) 45vw, 280px"
                      }
                      className="object-cover"
                      onError={(e) => {
                        if (image.fallbackPath) {
                          e.currentTarget.src = image.fallbackPath;
                        }
                      }}
                    />

                    {image.business && (
                      <div
                        className={`pointer-events-none absolute inset-0 z-40 flex bg-black/92 transition-opacity duration-300 backdrop-blur-sm max-md:items-start max-md:justify-start max-md:px-4 max-md:pt-3 max-md:pb-4 md:items-center md:justify-center md:px-5 md:py-8 ${
                          isExpanded
                            ? "opacity-100"
                            : "opacity-0 [@media(hover:hover)]:group-hover/card:opacity-100"
                        }`}
                      >
                        <p
                          className={`max-h-full w-full overflow-y-auto overscroll-contain font-medium text-white max-md:text-left max-md:text-xs max-md:leading-[1.65] sm:text-xs sm:leading-relaxed md:text-center ${
                            isExpanded ? "max-md:line-clamp-none" : ""
                          }`}
                        >
                          {image.business}
                        </p>
                      </div>
                    )}

                    <div
                      className={`absolute top-0 left-0 z-30 max-w-[60%] rounded-br-md bg-black/80 px-3 py-2 backdrop-blur-sm transition-opacity duration-300 sm:max-w-[70%] ${
                        hideChrome
                          ? "max-md:invisible max-md:opacity-0"
                          : "opacity-100 [@media(hover:hover)]:group-hover/card:opacity-0"
                      }`}
                    >
                      <p className="text-left text-xs font-bold leading-tight text-white sm:text-sm">
                        {image.name}
                      </p>
                    </div>

                    <div
                      className={`absolute top-2 right-2 z-50 flex max-w-[55%] flex-row flex-wrap justify-end gap-1.5 sm:max-w-[48%] ${
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

                  <div
                    className={`shrink-0 border-t border-white/10 bg-black/90 px-3 py-2.5 backdrop-blur-sm transition-opacity duration-300 ${
                      isExpanded
                        ? "max-md:invisible max-md:h-0 max-md:overflow-hidden max-md:border-0 max-md:py-0"
                        : ""
                    }`}
                  >
                    <p className="line-clamp-3 text-left text-[11px] font-medium leading-snug text-white/90 sm:line-clamp-2 sm:text-xs">
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
