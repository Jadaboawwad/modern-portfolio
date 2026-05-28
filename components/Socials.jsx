import Link from "next/link";

import {
  RiGithubLine,
  RiLinkedinLine,
  RiFileTextLine,
} from "react-icons/ri";

export const socialData = [
  {
    name: "LinkedIn",
    link: "https://www.linkedin.com/in/jadabuawwad/",
    Icon: RiLinkedinLine,
  },
  {
    name: "Github",
    link: "https://github.com/jadaboawwad",
    Icon: RiGithubLine,
  },
  {
    name: "CV",
    link: "https://drive.google.com/file/d/1rPgJzqRG_WPK88mK4jbskuYKMscXGC_x/view?usp=sharing",
    Icon: RiFileTextLine,
  },
];

const Socials = () => {
  return (
    <div className="flex items-center gap-x-5 text-lg">
      {socialData.map((social, i) => (
        <Link
          key={i}
          title={social.name}
          href={social.link}
          target="_blank"
          rel="noreferrer noopener"
          className={`${
            social.name === "Github"
              ? "bg-accent rounded-full p-[5px] hover:text-white"
              : "hover:text-accent"
          } transition-all duration-300`}
        >
          <social.Icon aria-hidden />
          <span className="sr-only">{social.name}</span>
        </Link>
      ))}
    </div>
  );
};

export default Socials;
