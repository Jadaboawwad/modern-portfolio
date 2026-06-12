import ChatbotFloat from "./ChatbotFloat";
import WhatsAppFloat from "./WhatsAppFloat";

const FloatingActions = () => {
  return (
    <div className="fixed z-40 flex flex-col-reverse items-center gap-2.5 bottom-[5.75rem] right-3 max-sm:scale-90 sm:bottom-24 sm:right-4 md:bottom-8 md:right-8 md:scale-100 xl:right-24">
      <WhatsAppFloat inline />
      <ChatbotFloat inline />
    </div>
  );
};

export default FloatingActions;
