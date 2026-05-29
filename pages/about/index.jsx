import { motion } from "framer-motion";
import { useState } from "react";
import CountUp from "react-countup";
import {
  FaCss3,
  FaFigma,
  FaHtml5,
  FaJs,
  FaReact,
  FaWordpress,
} from "react-icons/fa";
import {
  SiAdobephotoshop,
  SiAdobexd,
  SiFramer,
  SiNextdotjs,
} from "react-icons/si";

import Avatar from "../../components/Avatar";
import Circles from "../../components/Circles";
import { fadeIn } from "../../variants";

const skillsList = [
  "N-tier",
  "n8n",
  "Docker",
  "Flask",
  "Chatbots",
  "Faiss",
  "LangChain",
  "Retrieval-Augmented Generation (RAG)",
  "Prompt Engineering",
  "Object Detection",
  "Image Segmentation",
  "Industrial Control",
  "Power Inverters",
  "DC Drives",
  "Mechatronics",
  "Device Fabrication",
  "Inverter",
  "Boolean Algebra",
  "Combinational Logic",
  "Sequential Logic",
  "CMOS",
  "MOSFET",
  "Applied Machine Learning",
  "Scikit-Learn",
  "Simulink",
  "VMAS",
  "PyTorch",
  "Pandas",
  "Matplotlib",
  "Reinforcement Learning",
  "Technical Support",
  "PMP",
  "Deep Learning",
  "Neural Networks",
  "SCADA",
  "Variable-Frequency Drives (VFD)",
  "Blender",
  "Communication",
  "Problem-Solving and Critical Thinking",
  "Emotional Intelligence",
  "RACI Matrix",
  "Technology Trends",
  "General Data Protection Regulation (GDPR)",
  "Technology Evaluation",
  "Quality Auditing",
  "BLoC",
  "AC drive",
  "Version Control",
  "Dart",
  "Digital Signal Processing",
  "Analog Signal Processing",
  "Amplifiers",
  "Embedded Systems",
  "Web Technologies",
  "Behavioral Design Pattern",
  "Firebase",
  "Crashlytics",
  "Redux",
  "Flutter",
  "Clean Architecture",
  "Python (Programming Language)",
  "Atomic Design Pattern",
  "REST APIs",
  "Django REST Framework",
  "Unit Testing",
  "Apollo GraphQL",
  "Sequelize.js",
  "GraphQL",
  "Restyle",
  "Mixpanel",
  "A/B Testing",
  "Mobile Application Development",
  "TypeScript",
  "Programmable Logic Controller (PLC)",
  "React Native",
  "Redux.js",
  "Web Development",
  "Artificial Intelligence (AI)",
  "Object-Oriented Programming (OOP)",
  "Machine Learning",
  "Semiconductors",
  "Robotics",
  "JavaScript",
  "MATLAB",
  "React.js",
  "Next.js",
  "Node.js",
  "Django",
  "Git",
  "Siemens TIA Portal",
];

const codeLanguagesList = [
  "Dart",
  "TypeScript",
  "JavaScript",
  "Python",
];

const projectsList = [
  "WeFix",
  "Resource Scheduling in Edge-Intelligence-Enabled Internet of Vehicles (IoV)",
  "Nuqayyem",
  "Blinx",
  "Olive",
  "ReStaged",
  "Quantalytics - Q.ai",
  "AIMedica",
  "PyArcade Games",
  "SeAssis",
  "Bionic Arm using EMG Technology",
  "Heart Rate Counter",
  "Dyanamic Traffic Light using Reed Switches and Arduino",
];

//  data
export const aboutData = [
  {
    title: "skills",
    info: [
      {
        title: "Software Development",
        icons: [
          FaHtml5,
          FaCss3,
          FaJs,
          FaReact,
          SiNextdotjs,
          SiFramer,
        ],
      },
      {
        title: "Mobile & AI",
        icons: [SiAdobephotoshop, FaFigma],
      },
    ],
  },
  {
    title: "github",
    info: [
      {
        title: "Toolbox",
        stage: "Tech stack I use most",
        details: [
          "Core: Flutter, Dart, TypeScript, JavaScript, Python, Node.js",
          "Infra: Docker, Git, Linux",
          "Web: HTML5, CSS3",
          "Workflow: VS Code, Bash",
        ],
      },
      {
        title: "LTUC / ASAC Learning Tracks",
        stage: "What I studied",
        details: [
          "Code 102 → fundamentals (Git/HTML/CSS/JS basics)",
          "Code 201 → DOM, OOP, APIs, local storage, CSS animations",
          "Code 301 → React + REST + Node + MongoDB + Auth",
          "Code 401 → Python/Django + Docker/JWT + ML + Data Structures",
          "Backend → REST/ORM/DB design/migrations",
        ],
      },
      {
        title: "All‑Time Coding (WakaTime)",
        stage: "5,124 hrs 1 min total",
        details: [
          "Top languages: Dart 40.75%, TypeScript 28.44%, Python 8.67%, JavaScript 6.52%",
          "Also: CSS 3.03%, JSON 2.60%, YAML 1.90%, Bash 1.68%, Markdown 1.06%",
        ],
      },
    ],
  },
  {
    title: "certificates",
    info: [
      {
        title: "Purple Certification: Design Verification Track",
        stage: "Mar 2025",
      },
      {
        title: "Purple Certification: SystemVerilog Verification using UVM",
        stage: "Mar 2025",
      },
      {
        title: "Purple Certification: SystemVerilog Assertions for Formal Verification",
        stage: "Mar 2025",
      },
      {
        title: "Purple Certification: SystemVerilog Testbench",
        stage: "Mar 2025",
      },
      {
        title: "Purple Certification: SystemVerilog for RTL Design",
        stage: "Mar 2025",
      },
      {
        title: "Purple Certification: SystemVerilog Assertion",
        stage: "Mar 2025",
      },
      {
        title: "Purple Certification: Very Deep Submicron (VDSM) Fundamentals",
        stage: "Jan 2025",
      },
      {
        title: "SystemVerilog Refresher",
        stage: "Feb 2025",
      },
      {
        title: "VHDL Refresher",
        stage: "Feb 2025",
      },
      {
        title: "Verilog Refresher",
        stage: "Feb 2025",
      },
      {
        title: "Design Verification: Comprehensive",
        stage: "Jan 2025",
      },
      {
        title: "Purple Certification: VLSI Basics",
        stage: "Jan 2025",
      },
      {
        title: "Purple Certification: Digital Design Fundamentals",
        stage: "Jan 2025",
      },
      {
        title: "Purple Certification: ASIC Design Flow",
        stage: "Jan 2025",
      },
      {
        title: "Purple Certification: CMOS Fundamentals",
        stage: "Jan 2025",
      },
      {
        title: "Applied Machine Learning — IEEE BAU",
        stage: "Dec 2024",
      },
      {
        title: "PMP® Certification Training Course",
        stage: "Aug 2024",
      },
      {
        title: "Neural Networks and Deep Learning",
        stage: "Jul 2022",
      },
      {
        title: "The Complete JavaScript Course",
        stage: "Jun 2022",
      },
      {
        title: "Mastering React with Mosh",
        stage: "May 2022",
      },
      {
        title: "The Ultimate React Native Series: Fundamentals",
        stage: "May 2022",
      },
      {
        title: "JavaScript Core Certification — SoloLearn",
        stage: "Feb 2022",
      },
      {
        title: "PLC Advanced & SCADA WINCC Runtime using TIA Portal Software for Engineers",
        stage: "Oct 2021",
      },
      {
        title: "Python Core Certification — SoloLearn",
        stage: "Oct 2021",
      },
      {
        title: "Machine Learning Training (ACBPT) — Codesk Solutions",
        stage: "Jan 2021",
      },
      {
        title: "Artificial Intelligence Bootcamp (120 Hours) — Codesk Solutions",
        stage: "Jan 2021",
      },
      {
        title: "PLC & SCADA Workshop (4 Hours) — IEEE BAU",
        stage: "Mar 2020",
      },
      {
        title: "Internet of Things Course (12 Hours) — Microelectron Center",
        stage: "Mar 2020",
      },
      {
        title: "MATLAB Programming (20 Training Hours) — Aqaba University of Technology",
        stage: "Feb 2020",
      },
      {
        title: "Variable Frequency Drive Workshop (5 Hours) — IEEE BAU",
        stage: "Sep 2019",
      },
      {
        title: "MATLAB Programming (30 Hours) — Anwar Al Olama' Academy",
        stage: "Jul 2019",
      },
      {
        title: "3D Modeling Workshop (5 Hours) — IEEE BAU",
        stage: "Mar 2019",
      },
      {
        title: "Life Skills Training (32 Hours) — Wadi Al-Seer Training College",
        stage: "May 2016",
      },
    ],
  },
  {
    title: "experience",
    info: [
      {
        title: "Software and Quality Engineer — JoPath (WeFix)",
        stage: "Dec 2025 – Now",
      },
      {
        title: "Software and Quality Engineer — CSC Beyond",
        stage: "May 2025 – Dec 2025",
      },
      {
        title: "AI Specialist (Part-time) — 4Tech (Ahmad Mubarak Company for Technology)",
        stage: "Oct 2024 – Mar 2025",
      },
      {
        title: "Technical Advisor (Part-time) — Decisionware",
        stage: "Jul 2024 – Sep 2024",
      },
      {
        title: "Mobile Developer (Part-time) — Nuqayyem (Al Hussein Technical University)",
        stage: "Nov 2023 – Jun 2024",
      },
      {
        title: "Software and Quality Engineer (Full-time) — Optimum Partners",
        stage: "Jan 2022 – Nov 2023",
      },
      {
        title: "Full Stack Web Developer (Intern) — ASAC (Al Ghurair School of Advanced Computing)",
        stage: "Jun 2021 – Nov 2021",
      },
      {
        title: "Machine Learning Engineer (Intern) — Codesk Solutions",
        stage: "Jun 2021 – Dec 2021",
      },
      {
        title: "Industrial Maintenance Engineer (Intern) — Jihad Al-Atti Electronics",
        stage: "Jun 2020 – Dec 2020",
      },
      {
        title: "Industrial Electronics Technician (Intern) — Al-Saha for electrical systems",
        stage: "Apr 2016 – May 2016",
      },
    ],
  },
  {
    title: "education",
    info: [
      {
        title: "Diploma of Education, Design Verification Track — Princess Sumaya University for Technology",
        stage: "Dec 2024 – Jun 2025",
      },
      {
        title: "Diploma of Education, Web Development — Code Fellows",
        stage: "Jun 2021 – Dec 2021",
      },
      {
        title: "Bachelor's degree, Bachelor of Engineering (BE), Mechatronics, Robotics, and Automation Engineering — Al Balqa Applied University",
        stage: "2018 – 2021",
      },
      {
        title: "Diploma of Education, Industrial Electronics Technology/Technician — Wadi Seer Training Center",
        stage: "2016 – 2018",
      },
      {
        title: "High School Diploma, Scientific — Al Hussain College",
        stage: "Feb 2014 – Feb 2016",
      },
    ],
  },
];

const About = () => {
  const [index, setIndex] = useState(0);

  return (
    <div className="h-full min-h-0 bg-primary/30 overflow-y-auto overflow-x-hidden scrollbar-hide text-center xl:text-left xl:overflow-hidden">
      <Circles />

      {/* avatar img */}
      <motion.div
        variants={fadeIn("right", 0.2)}
        initial="hidden"
        animate="show"
        exit="hidden"
        className="hidden xl:flex absolute bottom-0 -left-[370px]"
      >
        <Avatar />
      </motion.div>

      <div className="container mx-auto px-4 sm:px-[15px] py-32 pb-[calc(11rem+env(safe-area-inset-bottom,0px))] xl:pb-32 min-h-full flex flex-col items-center xl:flex-row gap-x-6">
        {/* text */}
        <div className="flex-1 flex flex-col justify-center">
          <motion.h2
            variants={fadeIn("right", 0.2)}
            initial="hidden"
            animate="show"
            exit="hidden"
            className="h2"
          >
            About <span className="text-accent">me</span>.
          </motion.h2>
          <motion.p
            variants={fadeIn("right", 0.4)}
            initial="hidden"
            animate="show"
            className="max-w-[500px] mx-auto xl:mx-0 mb-6 xl:mb-12 px-2 xl:px-0"
          >
            Experienced Mechatronics Engineer with a demonstrated history of
            working in AI and software development. Skilled in Python (AI/ML/DL/RL)
            and JavaScript/TypeScript/Dart for modern web and mobile applications.
          </motion.p>

          {/* counters */}
          <motion.div
            variants={fadeIn("right", 0.6)}
            initial="hidden"
            animate="show"
            className="hidden md:flex md:max-w-xl xl:max-w-none mx-auto xl:mx-0 mb-8"
          >
            <div className="flex flex-1 xl:gap-x-6">
              {/* certifications */}
              <div className="relative flex-1 after:w-[1px] after:h-full after:bg-white/10 after:absolute after:top-0 after:right-0">
                <div className="text-2xl xl:text-4xl font-extrabold text-accent mb-2">
                  <CountUp start={0} end={32} duration={5} />
                </div>
                <div className="text-xs uppercase tracking-[1px] leading-[1.4] max-w-[100px]">
                  Certifications.
                </div>
              </div>

              {/* projects */}
              <div className="relative flex-1 after:w-[1px] after:h-full after:bg-white/10 after:absolute after:top-0 after:right-0">
                <div className="text-2xl xl:text-4xl font-extrabold text-accent mb-2">
                  <CountUp start={0} end={projectsList.length} duration={5} />
                </div>
                <div className="text-xs uppercase tracking-[1px] leading-[1.4] max-w-[100px]">
                  Projects.
                </div>
              </div>

              {/* skills */}
              <div className="relative flex-1 after:w-[1px] after:h-full after:bg-white/10 after:absolute after:top-0 after:right-0">
                <div className="text-2xl xl:text-4xl font-extrabold text-accent mb-2">
                  <CountUp start={0} end={skillsList.length} duration={5} />
                </div>
                <div className="text-xs uppercase tracking-[1px] leading-[1.4] max-w-[100px]">
                  Skills.
                </div>
              </div>

              {/* languages */}
              <div className="relative flex-1">
                <div className="text-2xl xl:text-4xl font-extrabold text-accent mb-2">
                  <CountUp start={0} end={codeLanguagesList.length} duration={5} />
                </div>
                <div className="text-xs uppercase tracking-[1px] leading-[1.4] max-w-[100px]">
                  Languages.
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* info */}
        <motion.div
          variants={fadeIn("left", 0.4)}
          initial="hidden"
          animate="show"
          exit="hidden"
          className="flex flex-col w-full max-w-full xl:max-w-[48%] min-h-0 xl:h-[480px]"
        >
          <div
            className="grid grid-cols-5 gap-x-0.5 w-full mb-5 xl:flex xl:gap-x-8 xl:w-auto xl:mb-4"
            role="tablist"
            aria-label="About sections"
          >
            {aboutData.map((item, itemI) => (
              <button
                type="button"
                key={itemI}
                role="tab"
                aria-selected={index === itemI}
                className={`${
                  index === itemI &&
                  "text-accent after:bg-accent after:transition-all after:duration-300"
                } cursor-pointer capitalize text-[clamp(0.4375rem,2.35vw,1.125rem)] leading-tight tracking-tight text-center xl:text-left xl:text-lg xl:tracking-normal relative after:content-[''] after:block after:h-[2px] after:w-6 sm:after:w-8 after:bg-white after:absolute after:bottom-0 after:left-1/2 after:-translate-x-1/2 xl:after:left-0 xl:after:translate-x-0 xl:after:-bottom-1 bg-transparent border-0 text-inherit font-inherit px-0.5 pb-2 min-w-0`}
                onClick={() => setIndex(itemI)}
              >
                {item.title}
              </button>
            ))}
          </div>

          <div className="py-2 xl:py-6 flex flex-col gap-y-4 xl:gap-y-4 items-center xl:items-start w-full flex-1 min-h-0 xl:overflow-y-auto pr-0 sm:pr-2 scrollbar-hide pb-4">
            {aboutData[index].info.map((item, itemI) => (
              <div key={itemI} className="w-full">
                <div className="w-full text-white/60 text-center md:text-left grid gap-y-1 md:grid-cols-[minmax(0,1fr)_auto] md:gap-x-10 md:items-start">
                  {/* title */}
                  <div className="font-light min-w-0 whitespace-normal">
                    {item.title}
                  </div>
                  <div className="text-white/40 md:text-white/60 md:text-right md:max-w-[320px]">
                    {item.stage}
                  </div>

                  {!!item.icons?.length && (
                    <div className="flex gap-x-4 md:col-span-2 justify-center md:justify-start pt-1">
                      {item.icons.map((Icon, iconI) => (
                        <div key={iconI} className="text-2xl text-white">
                          <Icon />
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {!!item.details?.length && (
                  <ul className="mt-2 md:mt-3 max-w-[900px] mx-auto md:mx-0 text-left text-white/50 space-y-2 list-disc pl-5">
                    {item.details.map((d, di) => (
                      <li key={di} className="leading-relaxed">
                        {d}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
            {/* clearance above mobile bottom nav */}
            <div
              className="h-16 shrink-0 xl:hidden"
              aria-hidden
            />
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default About;
