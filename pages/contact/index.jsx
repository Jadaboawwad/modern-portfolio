import { motion } from "framer-motion";
import { BsArrowRight } from "react-icons/bs";

import { fadeIn } from "../../variants";

const Contact = () => {
  const handleSubmit = (event) => {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);

    const name = String(formData.get("name") ?? "").trim();
    const email = String(formData.get("email") ?? "").trim();
    const subject = String(formData.get("subject") ?? "").trim();
    const message = String(formData.get("message") ?? "").trim();

    const fullSubject = subject || "Portfolio contact";
    const body = [
      message,
      "",
      `From: ${name}${email ? ` <${email}>` : ""}`,
      "Sent via jehadabuawwad.com portfolio",
    ].join("\n");

    const mailto = `mailto:jehadabuawwad@outlook.com?subject=${encodeURIComponent(
      fullSubject
    )}&body=${encodeURIComponent(body)}`;

    // Navigate in the same user-gesture turn so the OS default mail client opens.
    window.location.assign(mailto);
  };

  return (
    <div className="min-h-full bg-primary/30 max-xl:overflow-y-auto xl:h-full">
      <div className="container mx-auto px-4 pb-28 pt-4 text-center max-xl:items-start xl:flex xl:h-full xl:items-center xl:justify-center xl:py-32 xl:text-left">
        {/* text & form */}
        <div className="flex flex-col w-full max-w-[700px]">
          {/* text */}
          <motion.h2
            variants={fadeIn("up", 0.2)}
            initial="hidden"
            animate="show"
            exit="hidden"
            className="h2 text-center mb-12"
          >
            Let&apos;s <span className="text-accent">connect.</span>
          </motion.h2>

          {/* form */}
          <motion.form
            variants={fadeIn("up", 0.4)}
            initial="hidden"
            animate="show"
            exit="hidden"
            className="flex-1 flex flex-col gap-6 w-full mx-auto"
            onSubmit={handleSubmit}
            autoComplete="off"
            autoCapitalize="off"
            name="contact"
          >
            {/* input group */}
            <div className="flex gap-x-6 w-full">
              <input
                type="text"
                name="name"
                placeholder="Name"
                className="input"
                required
                aria-required
              />
              <input
                type="email"
                name="email"
                placeholder="E-mail"
                className="input"
                required
                aria-required
              />
            </div>
            <input
              type="text"
              name="subject"
              placeholder="Subject"
              className="input"
              required
              aria-required
            />
            <textarea
              name="message"
              placeholder="Message..."
              className="textarea"
              required
              aria-required
            />
            <button
              type="submit"
              className="btn rounded-full border border-white/50 max-w-[170px] px-8 transition-all duration-300 flex items-center justify-center overflow-hidden hover:border-accent group"
            >
              <span className="group-hover:-translate-y-[120%] group-hover:opacity-0 transition-all duration-500">
                Let&apos;s talk
              </span>

              <BsArrowRight
                className="-translate-y-[120%] opacity-0 group-hover:flex group-hover:-translate-y-0 group-hover:opacity-100 transition-all duration-300 absolute text-[22px]"
                aria-hidden
              />
            </button>
          </motion.form>
        </div>
      </div>
    </div>
  );
};

export default Contact;
