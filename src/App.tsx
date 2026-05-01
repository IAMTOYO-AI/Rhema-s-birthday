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
  { 
    id: 1, 
     url: '/images/memory1.jpg',
    caption: 'The day we first laughed together.', 
    story: 'That Tuesday afternoon wasn\'t supposed to be special, but then you told that ridiculous joke about the penguin. I don\'t even remember the punchline anymore, but I remember how your eyes crinkled at the corners. It was the first time I realized that your laughter was my favorite sound in the world.\n\nWe sat on that bench for hours, ignoring the world around us, just caught in the orbit of our own joy. Every time I see this picture, I can still feel the warmth of that sun and the lightness in my chest that hasn\'t gone away since.',
    date: 'Spring 2023' 
  },
  { 
    id: 2, 
    url: 'https://lh3.googleusercontent.com/pw/AP1GczOfHeQYb3pJ2U0Lyg-0tSG-uP-XXYRqPCe961OmzKudD0rMsfoG9B-OoewDeDGPfTHhNeHJ3ltu3pq4sERbp0jg0cxnldRK20MxdNjuk-_mQaT_0iThIAXnlzErhIC9kCjxFG2u3uVJTrOxwX6LhPgFJIojctOJhMTQjALMY9DTf-ieYjP4XijBucUNKIyC9dUhbh3tNMTxajKmeOsFgXRdfZZohvSQax3TYBuS4X_lyNloX4oCqQ4XSa-eRavM57BaR7Bf6OcXJMMAtX0WjjspTKGnlOlqiUusTqN6NnRqT6A8H-xL383KfdFJ5gGkwssggcJFMr8bzC3Da6J450gXY9YILLHG-gyk4wDbWczLy3uf5Ng0G9khsmRNydh4BFbf74t919CfuBL9BFIpnPFx5v3shYhRRodTZVhI91VXQhA4rU8MJUlOtXSxFZRgZVgqGbwf-tl5aHdVtRfk3eY8TiWPHRxPARXvTa3QhAW6zVMmJh5uBK7oLczBr9k8Mmeh7HII4t8jKdyIUURZX5EhMB-m0u9ttgKkV6W63r-nejI9OBt0OOLE1G4mrBkBJn1VG3DiLdyHmv16ALMwarQpVCKo4rYDuNOcOtwfggteSE3dNRK7DG4PqUuiKcw_4xZooSH4JYnLuFsbk1gMIz-V6mFmtcxkGe6jWR4CKAnwr3Ft6P2enkeJ5uEa1SCK13QqDOhfE7F0Zm4R1yooZyyNASe1HXzymEi5SpzXri4g1EMtXzBiNmWMRHtIjH0GwLvMFcSFa-BHxZWcaA-ksRz08_HXVzJwSLW8QCMdr6mHtCVYzDY15GhQeoekiSn6pY7fkF4ejNoouEXJ94OBJQLZ74336hHPm-cSa7hC7OIyBFuDTcjre1k29M7ciHg0xGxBlymcb52ICJ05=w586-h780-s-no?authuser=0', 
    caption: 'Sunset silhouettes and promises.', 
    story: 'We watched the sky turn from gold to violet, and for a moment, everything was quiet. You looked at me and said you felt like the world was too big, but in that moment, the only world I cared about was right here.\n\nYou have this incredible ability to make even the grandest landscapes feel intimate. This sunset was beautiful, but it was just the backdrop to the conversation we had about our dreams and where we wanted to go. I\'m so glad those paths led us here.',
    date: 'Summer 2023' 
  },
  { 
    id: 3, 
    url: 'https://lh3.googleusercontent.com/pw/AP1GczNt4JkOONEuvB2olqzt_VLU4M8itrjrDY1AOplGxTg0MUI9hvRbC6-GDWeV2ItzE9bCS930F7kbcXCUkO9QLgqwJEOV2Ppx88wYDAgbqTJnuY4-oQW4QrdzENbxcRIUAKKLN5Hk9CvrLDyIVU2azFO5xdCdMfpE633AYpMaBu3RGUr1Td7TLE7H0qKdms6OdFtPINc0gz_ffgqhIqFzFS2VmUsfLu_Tm2xHhFcTC_vaSBMPOU5jt3ts9rHyZ4Agn3TYF6q6_h1DuHf5OixNJTHcjLk4aVIWMrhffegWquCy2srsAWdIezqQhLMDhcf4KdbOk8cybg0fh952-j3aCFMsL331KGIQLIKQtbJ7jWRgP9tDt5jRLF1JTcA_y9Z13YoILDM7IPi4SZd9nzR_qVjpkmiDwMcaqYYLTzM--uAMdDSenoMEvfTdFQZ5Ixx8h4H2YAuIrBxRJ0BTkrsBNtrsYW7E44nQcJe0c2SNZoA8SmT6t7pohScnmvLrDUAc65NL-VmrKUg5K-odczFN9vXeiAPqWCYzhSSflz-4Dqocm7SB1f_BPXZ0as2taMERcDbUxks-nZCclmwTc-6pqMAphW2Urv70E8KB4xanjV4LBy7AyP2z6L7n0yyZPe7bm_VK09JnMTAjxqZV7X24akzmq-Pw8iWNPu6hNICGDCVsPv-KwYPtsz7WZxHHpl6wKnu7lHeXoWqDk_nYW3jRi_lGXi2nmU8d3aLWvJw9HDi0s146Ww0gTGPX5gU2EvYN4G0586KnTTBEepWhMZHdIv992D_5Z9Hdh1bmkzeXfU8q_kcJ_gcNijUzPgreVnJ9lPIW_m7VdNWU2YC3VFFuNteVbaOTWkR81g4wNNCVoQC_ahlpgottFgO4u3BjRBXbyUY5VRhZB_QAafUoozI=w828-h561-s-no?authuser=0', 
    caption: 'A masterpiece of grace.', 
    story: 'I caught you looking at the rain, completely lost in thought. You didn\'t see me take this, and that\'s why it\'s my favorite. It\'s the "between" moments—the unposed, unscripted versions of you—that truly show your light.\n\nRhema, you don\'t have to try to be beautiful; you just are. Even in the greyest weather, you carry a vibrance that makes the world feel colorful. This photo is a reminder that beauty isn\'t a performance for you, it\'s your natural state.',
    date: 'Autumn 2023' 
  },
  { 
    id: 4, 
    url: 'https://lh3.googleusercontent.com/pw/AP1GczMAAuCB9JGF01k0hUepmSa9li_0HCyzpOloF8YU8NCwg96Z0cVeHnGhsrhQ6n-vBnwHUAocHdU-fbWYNohiPLFptfn7GqZHyUcv9FvkC8wLdsOuTRC8sqIJx8XXKammMDDHCForT0vQN6PRZWZEsmX0UGYrZZLTO0g_QYsxzzNQkRa6AmDpNDzZi8qS249zRH6RK21ayQUseKYAnEsh6H8wmltGFwUAJhmBa72tZI9mIAm2QMJCPkA2yt5S7KQF2HDheebg01HrOc5fidRFnoNp4Gy3p1pP9yngF6uDHPm7WkyyYOjHgp4qG6trMsuhWPxZFNIAJ6ZThtCl-9cMS1UXLZFOAzOfC42BW5TMvkFcI8D4lqpgIQaQcPEMFqLslsoopowSPFiGf9YMOMkvtnvdW1ldDCxgfnfcu-M0xx_vD47ZKV4rpGoBjrV6lrlnfHEonae2vfPDU18hYcqeGLTaEeMRH7eV527JAkXdxJWcQcq0IFZ4QOGAAWVOzbcu2zpsmpmZgxC2xj_De032KgNU1iK1C1bG5WznLCQH7TEHBM_aMh-iDWoWJJKv9bohjlLmArQR_O_CDUXpK8U7dTwMHe7PicfLyy5G6RxI_xS3uyTAfSeyvMbOCvIzAcsq8jLoRXyv3kzoGGAw310YteqqlBI-VCqqhlblVlenaWHDpcHY6163QkMFS1K__G6BLXPrtFr1FJE-UCsv0Uv3M5yfeRpuBjYcPIKz8xx6J3NhpM2e7r0_vHLZ2-D9leNDwkKGvTNmXQmfMkRT_KoDvg2tU_VtVeTLUV9N3ezgjrF8sEjdVw-qkcQfRmRVRYb1PTuqu4FrAcb4wkIhCA_Mo77sXpCqbKndkZ1y8tvG7y_M2wxDMUC7it9dk9fYNg7qhY2FTBQGvb6H1LeZ=w1170-h1560-s-no?authuser=0', 
    caption: 'Our favorite quiet moments.', 
    story: 'Sometimes the best memories aren\'t the ones where we did big things, but the ones where we did nothing at all. This was one of those cold mornings where we stayed in, shared a single blanket, and just talked about everything and nothing.\n\nThe world outside was rushing, but inside, time had stopped. I think that\'s your superpower—you create a sanctuary wherever you go. Thank you for being my peace, Rhema.',
    date: 'Winter 2024' 
  },
  ];
const LETTERS: Letter[] = [
  {
    id: 1,
    title: "To My Rhema",
    content: "There are words, and then there is you. Words try to capture beauty, but you redefine it every morning. Happy birthday to the one who makes reality better than my dreams.",
    signature: "Toyosi, Yours Always"
  },
  {
    id: 2,
    title: "A Memory of Grace",
    content: "I remember when you walked into that room... the air just felt different. Lighter. Better. You have this way of making everything around you bloom, Rhema.",
    signature: "Feyi"
  },
   {
    id: 3,
    title: "To My Rhema",
    content: "There are words, and then there is you. Words try to capture beauty, but you redefine it every morning. Happy birthday to the one who makes reality better than my dreams.",
    signature: "Stephanie"
  },
   {
    id: 4,
    title: "To My Rhema",
    content: "There are words, and then there is you. Words try to capture beauty, but you redefine it every morning. Happy birthday to the one who makes reality better than my dreams.",
    signature: "Otokini"
  },
   {
    id: 5,
    title: "To My Rhema",
    content: "There are words, and then there is you. Words try to capture beauty, but you redefine it every morning. Happy birthday to the one who makes reality better than my dreams.",
    signature: "Dum Dum"
  },
   {
    id: 6,
    title: "To My Rhema",
    content: "There are words, and then there is you. Words try to capture beauty, but you redefine it every morning. Happy birthday to the one who makes reality better than my dreams.",
    signature: "Tehilla"
  },
   {
    id: 7,
    title: "To My Rhema",
    content: "There are words, and then there is you. Words try to capture beauty, but you redefine it every morning. Happy birthday to the one who makes reality better than my dreams.",
    signature: "Debbie"
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
            A heartfelt gift for my princess who makes every moment feel amazing. <br />
            Here's to the beauty and happiness you bring to every moment.
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
                whileHover={{ 
                  scale: 1.02, 
                  y: -8,
                  transition: { type: "spring", stiffness: 300, damping: 20 } 
                }}
                viewport={{ once: true }}
                className="relative bg-white p-10 md:p-16 rounded-[40px] shadow-2xl shadow-romantic-100/50 border border-romantic-100 cursor-default group"
              >
                <h3 className="serif text-2xl md:text-3xl mb-6 text-romantic-500 italic group-hover:text-romantic-600 transition-colors">"{letter.title}"</h3>
                <p className="text-lg md:text-xl text-gray-700 font-light leading-loose mb-8">
                  {letter.content}
                </p>
                <div className="text-right">
                  <p className="serif text-xl italic font-semibold text-gray-900">-{letter.signature}</p>
                </div>
                <motion.div 
                  whileHover={{ rotate: 180 }}
                  className="absolute -top-4 -left-4 w-12 h-12 bg-romantic-100 rounded-full flex items-center justify-center"
                >
                  <Sparkles className="w-6 h-6 text-romantic-500" />
                </motion.div>
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
