/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Heart, Stars, MessageCircle, Image as ImageIcon, BookOpen, Send, Sparkles, ChevronDown } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { getHeartfeltReply } from './services/gemini';

// Types
interface Message {
  role: 'user' | 'model';
  parts: { text: string }[];
}

interface Memory {
  id: number;
  url: string;
  caption: string;
  story: string;
  date: string;
}

interface Letter {
  id: number;
  title: string;
  content: string;
  signature: string;
}

// --- PERSONALIZATION SECTION ---
// Change these to make the website perfect for Rhema!

const RHEMA_NAME = "Rhema";

const MEMORIES: Memory[] = [
  { id: 1, url: 'https://lh3.googleusercontent.com/pw/AP1GczMXtY-jNcHLKtrV-arnhsAt8LFLnnJsbNpIVCKrvVFQQwMFWZOEThAsjkwURD50C63UUJFWZnyhI6jn3yzLlGavHDUcsoDkFg3JYxXVMtJh_kYxGLrwLKbXrkmNj-Sc9QLAOaervbP_VLXSYp4_4og3HGm02utzrwrp_53AcnJUhU_XGgepz7C7IJJ0qKqtuMw2J5NMe4T7-ONPK-73w2lD_ZPw21bBU3sOAB4Lf8giHlkyMuhZSisH70K2iqbSnjCDJZDdMmzxdaj2L1qfNbXQzQ0YPd59WSgBRLs4sqAqMuK9txLsAu9f0EeqHkA8PjmuiDfjeXpj-BfrZq_Qtbj2g3rQC0s4-Q8bY9Qxl0NTVNaXhzZarMiAoxdVbP0j0zzqu_XCACQ0oDm3LmMhGwD1nUiU0bDQTuZcgggPjgpQ0k1L94mUfwnS_NrM9Z7yHrPqHLhlGts0Vr5nVugL_01dbisl_h6LJf-9KXhERSyuIaDXWB75v76QddjxsACTmCMz2zrI7Zr42mlFcBl5uzScx2t9cJGvQkCo26xEU13FNqJNrDC37QsgmnwDNCHCJiwjJ2SE-1jb-1qq4cFM6TBf_YEE_z4XOhwhSnxUqemhBV4e3wcc10VfKwOE7lI-RMxw-cNXttimUeBcNq0b8Ch3DaW67z0lLqCEJryZ9wjkgmKElutE4z1WhCJptVvFIO2pA4bA9IyqM_CBfnY74iIy8jDsAZ4LfJPjEFe7MzyHF6nzZ8foqC_TGhHVggkYQl-bLU5EpWObqNRoEDu_7avm6OOYZIbY7RjH9FJwyPCvWt9OkYqz_LC2KLS0WZ8vkJmDBoN7TxIy5R4VnA4oRnc8xm6PQ_Es_Gc0BdIwsiM179XCwY6C4F2Vogx4dzqK8LUv1iHMIUz7-HlKlTE=w1170-h1560-s-no?authuser=0', caption: 'The day we first laughed together until we couldn\'t breathe.', date: 'Spring 2023' },


  { id: 2, url: 'https://lh3.googleusercontent.com/pw/AP1GczM4iUhBmJLnYvJo1Vq4dtKgJ7U39MHa8lbyEaGInxLQB7OuOTJX7mfwVUz4gFGbn4A-zzJwnPk2IPs3Ih8HxvKZbXDlIU39C7k_lDXj8Jp1zdufH7OfwLJeLBw2vWfsEvwtosxSSpGU9MvEgy0TwNNGBVLmurpm92tH2tEuxkekPWrNpPQbSWbFPGhH32oTeuOvLMIo8OsrvQ-l9cqxrn2bCEZB4JK5T4qRSGlNOkiPI3i_LnP4nr8G0AwVVvlzxMafgBSGMbRKFQI_2rYkPMyw8QDAdmLr2BANcvmziF7O5D04jTgq3t_g2LdbFFZwWYaZqs1Wctk8h7bibg8BOtD1iQExHKPHGE5rYOKFdqgbfKqpr1Z4-MQ70D96U87y5QqfMhbYsgT7QDV1YCnVSF5wBToMUs5F_kOY47t0LxQbUY2mEBkong5BLYwD2BhzOWDRwlpbkOArE3IxGHzXqIATcKa8SGFKp7pzJSJNV54KdxJBopOHEzIMumwBqpSWWyt75A9HOs1of96sN1dGsieXz8rhp2ZpG83TyzV6jHhpOrmJhVpRd04w6ugtSCTx92VJj_nXSX7ZHQvTiqAjvVcklBpddgAwiOWu10FoPznvemMUZ9Z9xMqKP9CgJs0xxgi8UZpHsiYwYdoXWLCTeWZiUEY83tAnrcyF3D7wHQgTb--O8AuWCNa29Hf9WFBF0IYU_Ix5SkMXweVvUonVNrGQyVhBPKn1X1gUMM-V2L_1bmhwaJCZOf8pdYmFptmD1HFtcVO08KUPJs5RI59kLvZZK_6UmIncCsEmA8lgP589NtqpRIAB4HiM0axrzS3qUGP339IjDSiYJxM7p38OeohHVgCHAWpHU3LHHKuyIX1LVP74oNlh--bOnd4zdM8-58EDVYQW2jYlKc0KxGw=w1170-h1560-s-no?authuser=0', caption: 'Sunset silhouettes and promises of a thousand tomorrows.', date: 'Summer 2023' },


  { id: 3, url: 'https://lh3.googleusercontent.com/pw/AP1GczOxVQoVbCKascl8g8cnejj-YcKGIpNxU8vd3QyNVFTLe0H68GNQOhN5vDISfvY2_8B9z0wZS7paULfahTMbRgMY9iFZnoPGNbIy5Px99R6tWg2B098GBOVx71ZlgrjdM9cmwK01yNAa0lsosriq4lq6cZCIOAkeqzE3MoCmbMnkPKMn1jzj4dWH-BywNFElu6-M5hWhmfGNamg4dkdApyNzCmroQa-TZqyZLALiJ6JhUkmXJEKkUBXd6-DxlgoyT9nPaDYrzQm4fuTshPjPq3WzDngXuvPFmpkrPzGrXcPf1ZGzdGs-X8QzvajqVNaOGIfxNAibUgP44MeUre7YGpxZxhkqn8so5uElqxwTe8BHNP3YxznNhCyxvc6OGMOeoSROpYXQ9Vvvsbdjx9Ieaf9l1T0EZs-y_V2MYGXXtt_AQvRJDKB_mgturW8ECvi0Y5ndH7jTUdOSQGhWiuzbOwMuMsluTzf1Wf1gh-VEOwDFtPNfBu02bo8ZgTSaJkXUTWuKNoVj6_BMn1FzBzQeRSJniG86gGdtBdMOQAjRQDhmz7RwqXQxS3HRV-MkEHr1ug83W3pPKPTYUXW-TAzHIsFoGbrk9oP2EdUFY_vdujd93PxuHLgn6kdGNK1ab8Imyzf1yVpIrgYRYcGOWTQ5ck8D1Oqp58rMnAjUG0qfYjWfisJF7mxknk3hIqXKqIMBcici0CRsfWMZVCvqoDOuvuODnVZJ3b14V-NGRofcf3IvMAclOhqF2kVsxzFZi-VPZ0ENQ1YVkbOAKraDAzKMJJMhijGk6hE29PxBsLL7UD_aoCSzMy6RLEAbjP-dqxLK0_k7uPecETbD9T139gRgPB0ddmjQzksqwy96Dossl50L_t7UTnU39WNcho5wt8748wgrjK-GI1CczNPZMQ=w586-h780-s-no?authuser=0', caption: 'Every picture of you is a masterpiece of grace.', date: 'Autumn 2023' },


  { id: 4, url: 'https://lh3.googleusercontent.com/pw/AP1GczMDQPUEANTD9NdJdYaM2mI2z-5LYRbzZ0O5m6dLnWvvH6ka_jM6LL0udwDR-XdYky35B4ffKvSLdxXz_5I6aB_-HTcDMA9f-BOHE5PIXrKbz3TfdH1xDdjh_Yir9Py-BRZwGiA31lvfCyTgac1trmaLSOAq2wfpjeNcN2tQIQ0hHQyvz7W2j4jIlVkbkJjlSQiT54opc1P4kU6JDIjkldtLKkI2MheNsJqqW7OyCbqIgjusTefVtgVIZCs0l-3B6Cx5hwxEZW6ld1plSQN03qwz31blcvEir5co1vlNHfL5f21JQTYdo7stesbfRtWUhoqyZUEeod6zyDEUpb-cirDbqK4Cmd9N3tjPOWzB6qzHt1AV92W7BBw3u0V_uWnEOpbVmymiuDMzg63GwMYZIxLl3rUHQpNFc7DsGaH2rdFRaXLP9LzjCbO-2cESyaUlp_tSy7-RO0r0IG0lX1U0ryymELdZ-dlDYPqql0Dt0lcKvaAtxLg_x-6SA0u91ykwg9mcLUP_qB25yQHYpRy4KjSDXHh2XPPqXn0NpSuMJD94J7B03LQADvKDpop_8H0mPK9LyGOr0kCThkegGTfBbRSRaUHdltQ1wEw1PwoaVBBu_iP9SCHFfNTxtT4XhYDhmVXa3Zpdu1Tcfv_ZD5l-d-oCERnfgWPFsBe4vsk4ATe6KhpXPfT2dt6MEmQBeNuHVzlJw88iIYaYM3VGOdZKmIsSBW7f1H2pcYnUrBPi2I6KA7beWtL1IqZaua2oF9WSzWCb0vG4FIc-G_W8XdZcQd9YQJ-MCQIrmpGxMlgW5h8TVpY81jEyNhRHIsN6zL7hfII_rfVn1Mo0jkm4Vum1oQgbwDpERierlszw8xx9sF-CZAS4lasPnMhFThCJ4PqLmvm4EIedtbi7e_SJaKM=w1442-h1560-s-no?authuser=0', caption: 'Our favorite quiet moments where the world felt so small.', date: 'Winter 2024' },
];

const LETTERS: Letter[] = [
  {
    id: 1,
    title: "To My Rhema",
    content: "Words can't describe how amazing you are, knowing you has brought so much peace and joy, from the laughters, to the fights, to the late night talks, to the dates, every single moment with you feels so special. Happy Birthday my princess, I love you so much❤️",
    signature: "Toyosi, Yours Always"
  },
  {
    id: 2,
    title: "A Memory of Grace",
    content: "I remember when you walked into that room... the air just felt different. Lighter. Better. You have this way of making everything around you bloom, Rhema.",
    signature: "Stephanie"
  },
   {
    id: 3,
    title: "A Memory of Grace",
    content: "I remember when you walked into that room... the air just felt different. Lighter. Better. You have this way of making everything around you bloom, Rhema.",
    signature: "Feyi"
  },
   {
    id: 4,
    title: "A Memory of Grace",
    content: "I remember when you walked into that room... the air just felt different. Lighter. Better. You have this way of making everything around you bloom, Rhema.",
    signature: "Dum Dum"
  },
   {
    id: 5,
    title: "A Memory of Grace",
    content: "I remember when you walked into that room... the air just felt different. Lighter. Better. You have this way of making everything around you bloom, Rhema.",
    signature: "Otokini"
  },
   {
    id: 6,
    title: "A Memory of Grace",
    content: "I remember when you walked into that room... the air just felt different. Lighter. Better. You have this way of making everything around you bloom, Rhema.",
    signature: "Tehilla"
  }
];

// --- END OF PERSONALIZATION SECTION ---

export default function App() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [selectedMemory, setSelectedMemory] = useState<Memory | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleSend = async () => {
    if (!input.trim() || isTyping) return;

    const userMessage: Message = { role: 'user', parts: [{ text: input }] };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    const reply = await getHeartfeltReply(input, messages);
    setMessages(prev => [...prev, { role: 'model', parts: [{ text: reply! }] }]);
    setIsTyping(false);
  };

  return (
    <div className="min-h-screen font-sans selection:bg-romantic-300">
      <AnimatePresence>
        {selectedMemory && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-white flex flex-col md:flex-row overflow-y-auto"
          >
            <button 
              onClick={() => setSelectedMemory(null)}
              className="fixed top-6 left-6 z-[110] bg-white/80 hover:bg-white p-3 rounded-full shadow-lg transition-all active:scale-95"
            >
              <ChevronDown className="w-6 h-6 rotate-90 text-gray-800" />
            </button>

            {/* Left side: Image */}
            <div className="w-full md:w-1/2 h-[50vh] md:h-screen sticky top-0 bg-romantic-100 flex items-center justify-center p-4">
              <motion.img
                layoutId={`memory-img-${selectedMemory.id}`}
                src={selectedMemory.url}
                alt={selectedMemory.caption}
                className="w-full h-full object-cover rounded-2xl md:rounded-r-3xl shadow-2xl"
                referrerPolicy="no-referrer"
              />
            </div>

            {/* Right side: Blog Write-up */}
            <div className="w-full md:w-1/2 min-h-screen bg-white px-8 py-16 md:px-20 md:py-32 overflow-y-auto">
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
              >
                <p className="text-romantic-500 font-semibold tracking-widest uppercase text-sm mb-4">{selectedMemory.date}</p>
                <h2 className="serif text-4xl md:text-6xl font-bold mb-8 text-gray-900 leading-tight">
                  {selectedMemory.caption}
                </h2>
                
                <div className="w-20 h-1 bg-romantic-200 mb-12" />

                <div className="prose prose-lg prose-romantic max-w-none">
                  <p className="text-xl text-gray-700 leading-relaxed font-light italic mb-12">
                     "{selectedMemory.story}"
                  </p>
                  
                  <div className="pt-12 border-t border-romantic-100 mt-12">
                    <p className="serif text-2xl italic font-semibold text-romantic-500">
                      With all my love, always.
                    </p>
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      {/* Background Decor */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_20%_30%,_rgba(240,90,90,0.05)_0%,_transparent_50%)]" />
        <div className="absolute bottom-0 right-0 w-full h-full bg-[radial-gradient(circle_at_80%_70%,_rgba(240,90,90,0.05)_0%,_transparent_50%)]" />
      </div>

      {/* Hero Section */}
      <section className="relative h-screen flex flex-col items-center justify-center text-center px-4 overflow-hidden">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2, ease: "easeOut" }}
          className="z-10"
        >
          <motion.div
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 3, repeat: Infinity }}
            className="mb-6 inline-block"
          >
            <Heart className="w-16 h-16 text-romantic-500 fill-romantic-300" />
          </motion.div>
          <h1 className="serif text-5xl md:text-8xl font-bold text-gray-900 mb-4 tracking-tight">
            Happy Birthday, <br />
            <span className="text-romantic-500 italic">{RHEMA_NAME}</span>
          </h1>
          <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto font-light leading-relaxed">
            A celebration of a soul that shines brighter than the sun. <br />
            Here's to the beauty you bring to every moment.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5, duration: 1 }}
          className="absolute bottom-10 animate-bounce"
        >
          <ChevronDown className="w-6 h-6 text-gray-400" />
        </motion.div>

        {/* Floating Hearts Decor */}
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute z-0 text-romantic-200"
            animate={{
              y: [0, -100, -200],
              x: [0, Math.sin(i) * 50, 0],
              opacity: [0, 1, 0],
              scale: [0.5, 1, 0.5]
            }}
            transition={{
              duration: 5 + i,
              repeat: Infinity,
              delay: i * 0.8,
              ease: "linear"
            }}
            style={{
              left: `${15 + i * 15}%`,
              bottom: "-5%"
            }}
          >
            <Heart className="w-4 h-4 fill-current" />
          </motion.div>
        ))}
      </section>

      {/* Memory Lane Section */}
      <section className="py-24 bg-white/50 relative z-10">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex items-center gap-4 mb-12">
            <ImageIcon className="w-8 h-8 text-romantic-500" />
            <h2 className="serif text-3xl md:text-4xl font-bold">Memory Lane</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {MEMORIES.map((memory, i) => (
              <motion.div
                key={memory.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.2 }}
                onClick={() => setSelectedMemory(memory)}
                className="group cursor-pointer"
              >
                <div className="relative aspect-[3/4] overflow-hidden rounded-2xl mb-4 bg-gray-100 ring-1 ring-romantic-100 shadow-sm group-hover:shadow-xl transition-all duration-500">
                  <motion.img
                    layoutId={`memory-img-${memory.id}`}
                    src={memory.url}
                    alt={memory.caption}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                    <div className="text-white flex items-center gap-2 scale-90 group-hover:scale-100 transition-transform duration-300">
                      <BookOpen className="w-5 h-5" />
                      <span className="text-xs uppercase tracking-widest font-semibold">Read Story</span>
                    </div>
                  </div>
                </div>
                <p className="serif italic text-gray-700 leading-snug">{memory.caption}</p>
                <p className="text-xs text-romantic-500 uppercase tracking-widest font-semibold mt-1">{memory.date}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Letters Section */}
      <section className="py-24 relative z-10 overflow-hidden">
        <div className="max-w-4xl mx-auto px-4">
          <div className="flex items-center gap-4 mb-12">
            <BookOpen className="w-8 h-8 text-romantic-500" />
            <h2 className="serif text-3xl md:text-4xl font-bold text-gray-900">From the Heart</h2>
          </div>

          <div className="space-y-16">
            {LETTERS.map((letter, i) => (
              <motion.div
                key={letter.id}
                initial={{ opacity: 0, x: i % 2 === 0 ? -30 : 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="relative bg-white p-10 md:p-16 rounded-[40px] shadow-2xl shadow-romantic-100/50 border border-romantic-100"
              >
                <h3 className="serif text-2xl md:text-3xl mb-6 text-romantic-500 italic">"{letter.title}"</h3>
                <p className="text-lg md:text-xl text-gray-700 font-light leading-loose mb-8">
                  {letter.content}
                </p>
                <div className="text-right">
                  <p className="serif text-xl italic font-semibold text-gray-900">-{letter.signature}</p>
                </div>
                <div className="absolute -top-4 -left-4 w-12 h-12 bg-romantic-100 rounded-full flex items-center justify-center">
                  <Sparkles className="w-6 h-6 text-romantic-500" />
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* AI Assistant Section */}
      <section className="py-24 bg-romantic-100/30 relative z-10 border-t border-romantic-100">
        <div className="max-w-3xl mx-auto px-4">
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-white rounded-full shadow-lg mb-4 ring-4 ring-romantic-200">
              <MessageCircle className="w-8 h-8 text-romantic-500" />
            </div>
            <h2 className="serif text-3xl font-bold mb-2">Speak to my Heart</h2>
            <p className="text-gray-600">A space for heartfelt replies, just for you, {RHEMA_NAME}.</p>
          </div>

          <div className="glass rounded-[32px] overflow-hidden flex flex-col h-[500px] shadow-2xl border border-white">
            <div className="flex-1 overflow-y-auto p-6 space-y-6 chat-scroll bg-white/20">
              {messages.length === 0 && (
                <div className="h-full flex flex-col items-center justify-center opacity-40 text-center px-10">
                  <Stars className="w-12 h-12 mb-4 text-romantic-400" />
                  <p className="serif text-lg italic">Say hello, birthday girl...</p>
                </div>
              )}
              {messages.map((msg, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[85%] px-5 py-3 rounded-2xl ${
                      msg.role === 'user'
                        ? 'bg-romantic-500 text-white shadow-lg'
                        : 'bg-white/80 text-gray-800 shadow-sm border border-romantic-100'
                    }`}
                  >
                    <div className="markdown-body prose prose-sm prose-romantic max-w-none">
                      <ReactMarkdown>{msg.parts[0].text}</ReactMarkdown>
                    </div>
                  </div>
                </motion.div>
              ))}
              {isTyping && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex justify-start px-4 italic text-romantic-400 text-sm animate-pulse serif"
                >
                  Finding the perfect words for you...
                </motion.div>
              )}
              <div ref={chatEndRef} />
            </div>

            <div className="p-4 bg-white/50 border-t border-romantic-100">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                  placeholder={`What's on your heart, ${RHEMA_NAME}?`}
                  className="flex-1 bg-white px-6 py-3 rounded-full border border-romantic-200 focus:outline-none focus:ring-2 focus:ring-romantic-400 transition-all text-gray-800 font-light"
                />
                <button
                  onClick={handleSend}
                  disabled={!input.trim() || isTyping}
                  className="w-12 h-12 flex items-center justify-center bg-romantic-500 text-white rounded-full hover:bg-romantic-600 transition-all disabled:bg-romantic-200 disabled:cursor-not-allowed shadow-lg hover:shadow-xl active:scale-95"
                >
                  <Send className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 bg-white text-center border-t border-romantic-100 relative z-10">
        <p className="serif italic text-gray-400">Made with a heart full of love for {RHEMA_NAME}.</p>
        <p className="text-xs text-romantic-300 uppercase tracking-widest mt-2">{new Date().getFullYear()} Special Edition</p>
      </footer>
    </div>
  );
}
