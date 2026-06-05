import ChatbotFloat from "./ChatbotFloat";
import WhatsAppFloat from "./WhatsAppFloat";

const FloatingActions = () => {
  return (
    <div className="fixed z-40 flex flex-col-reverse items-center gap-3 bottom-24 right-4 md:bottom-8 md:right-8 xl:right-24">
      <WhatsAppFloat inline />
      <ChatbotFloat inline />
    </div>
  );
};

export default FloatingActions;
