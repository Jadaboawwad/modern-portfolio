import Link from "next/link";
import { RiWhatsappFill } from "react-icons/ri";

const WHATSAPP_NUMBER = "962777002130";
const WHATSAPP_URL = `https://wa.me/${WHATSAPP_NUMBER}`;

const WhatsAppFloat = () => {
  return (
    <Link
      href={WHATSAPP_URL}
      target="_blank"
      rel="noreferrer noopener"
      title="Contact me on WhatsApp"
      aria-label="Contact me on WhatsApp"
      className="fixed z-40 flex items-center justify-center w-14 h-14 rounded-full bg-[#25D366] text-white shadow-lg shadow-black/30 hover:bg-[#20bd5a] hover:scale-110 transition-all duration-300 bottom-24 right-4 md:bottom-8 md:right-8 xl:bottom-8 xl:right-24"
    >
      <RiWhatsappFill className="text-3xl" aria-hidden />
    </Link>
  );
};

export default WhatsAppFloat;
