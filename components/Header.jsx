import Image from "next/image";
import Link from "next/link";

import Socials from "../components/Socials";

const Header = () => {
  return (
    <header className="fixed top-0 left-0 right-0 z-30 w-full border-b border-white/5 bg-primary/90 backdrop-blur-md xl:absolute xl:border-0 xl:bg-transparent xl:backdrop-blur-none">
      <div className="container mx-auto px-4 sm:px-[15px]">
        <div className="flex flex-row items-center justify-between gap-x-3 py-3 xl:gap-y-6 xl:py-8">
          <Link href="/" className="shrink-0">
            <Image
              src="/logo.png"
              alt="Jehad Abu Awwad"
              width={351}
              height={76}
              priority
              className="h-8 w-auto sm:h-10 md:h-12"
            />
          </Link>

          <div className="shrink-0 scale-90 sm:scale-100">
            <Socials />
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
