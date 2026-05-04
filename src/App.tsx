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
// Near the top of App.tsx

const REASONS = [
  "I love your smile",
  "You make everything feel easy",
  "You understand me in a way no one else does",
  "You’re my peace",
  "You make me laugh when I need it most",
  "You’re beautiful inside and out",
  "I love how you make ordinary moments feel special.",
  "Your kindness to everyone around you.",
  "I love how you support me when things get tough.",
  "I love your honesty.",
  "I love your voice.",
  "I love your sense of humor.",
  "I love how comfortable I feel around you.",
  "I love your confidence.",
  "I love how you handle challenges.",
  "I love how you stay true to yourself.",
  "I love your uniqueness.",
  "I love how you care deeply.",


];

const PHOTO_DUMP = [
  "https://res.cloudinary.com/dsuutxrh8/image/upload/v1777824598/F4F05EBA-F850-42B8-8FE6-255FAE7024E5_dhcnk4.gif",
  "https://res.cloudinary.com/dsuutxrh8/image/upload/v1777757374/e0fdcf17-d5d0-4978-804c-e43825ca2b27_esp2ai.jpg",
  "https://res.cloudinary.com/dsuutxrh8/image/upload/v1777757307/photo_2026-04-18_20.25.58_yimupb.jpg",
  "https://res.cloudinary.com/dsuutxrh8/image/upload/v1777756685/751ef8c1-78c2-465c-b6d0-ff4155760632_3_pwvdwg.jpg",
  "https://res.cloudinary.com/dsuutxrh8/image/upload/v1777756516/IMG_9571_vbz6xp.jpg",
  "https://res.cloudinary.com/dsuutxrh8/image/upload/v1777802867/85b16df2-975a-4e49-8eaf-3f90e621c2bd_g9zqwb.jpg",
  "https://res.cloudinary.com/dsuutxrh8/image/upload/v1777756287/e9dea867-2968-4e93-ba0b-aac9661b5249_qyb3bm.jpg",
  "https://res.cloudinary.com/dsuutxrh8/image/upload/v1777802864/photo_2025-11-03_23.16.29_m3iclq.jpg",
  "https://res.cloudinary.com/dsuutxrh8/image/upload/v1777756219/photo_2026-02-10_06.49.38_cgwcsp.jpg",
  "https://res.cloudinary.com/dsuutxrh8/image/upload/v1777802866/a64aa5c3-eefd-4218-8302-0290551c915c_qn94bn.jpg",
  "https://res.cloudinary.com/dsuutxrh8/image/upload/v1777802863/IMG_3431_qpvs5j.jpg",
  "https://res.cloudinary.com/dsuutxrh8/image/upload/v1777756178/6716484d-826d-4970-bfca-0c429a5b1e4c_vfrk7e.jpg",
  "https://res.cloudinary.com/dsuutxrh8/image/upload/v1777802862/IMG_3360_kanwzy.jpg",
  "https://res.cloudinary.com/dsuutxrh8/image/upload/v1777802862/photo_2025-11-03_23.18.34_ds0kqg.jpg",
  "https://res.cloudinary.com/dsuutxrh8/image/upload/v1777802860/photo_2026-04-26_12.56.27_ad1jax.jpg",
  "https://res.cloudinary.com/dsuutxrh8/image/upload/v1777802864/photo_2025-11-30_16.07.19_wowoxt.jpg",
  "https://res.cloudinary.com/dsuutxrh8/image/upload/v1777802863/IMG_3370_pgzcpc.jpg",
  "https://res.cloudinary.com/dsuutxrh8/image/upload/v1777808674/photo_2026-05-03_12.43.31_nclpwf.jpg",
  "https://res.cloudinary.com/dsuutxrh8/image/upload/v1777808673/photo_2026-05-03_12.43.29_kvguev.jpg",
  "https://res.cloudinary.com/dsuutxrh8/image/upload/v1777808673/photo_2026-05-03_12.43.28_st827b.jpg",
];
const MEMORIES: Memory[] = [
  { 
    id: 1, 
    url: 'https://res.cloudinary.com/dsuutxrh8/image/upload/v1777646523/memory2_skhnvn.jpg',
    caption: 'Where it all started.', 
    story: 'Even if I forgot every other day, I don’t think I could ever forget the day our story began. It was supposed to be just another normal day at the office with Stephanie, nothing special, nothing planned. But somehow, that ordinary day became one of the best days of my life. I remember seeing your pictures before we even met and wondering who you were. There was something about you that caught my attention. I didn’t say it out loud then, but I knew I was already a little drawn to you. Curious, interested. Maybe even a bit more than I wanted to admit at the time. And then Steph, being Steph, didn’t hesitate for a second. She looked at me and said we would be perfect for each other. I laughed it off, of course but deep down, I didn’t completely disagree. When we finally met, it felt awkward like first meetings usually do. I am so happy something so random ended up giving me the best partner I could ever wish for.',
    
  },
  { 
    id: 2, 
    url: 'https://res.cloudinary.com/dsuutxrh8/image/upload/v1777646522/memory1_i09d08.jpg',
    caption: 'Our first date.', 
    story: 'The walls were filled with color, meaning, stories but honestly, I barely remember most of the art. What I remember is you.We weren’t dating yet. Nothing was official. But you knew. I think that’s what made everything feel a little more real, a little more fragile. Every conversation felt like it mattered more than it should have for a casual day out. We looked at artworks, pretending to focus on the paintings, but really, we were just learning each other. The way you spoke, the way you laughed, the little pauses before you said something honest I noticed all of it. It didn’t feel like small talk. It felt like the beginning of something, even if neither of us said it out loud.There was this quiet comfort too. No pressure, no labels, no expectations. Just two people choosing to be there, choosing to talk, choosing to stay a little longer than necessary.Looking back, it’s funny how something so simple became so important. No big moment, no dramatic confession  just conversations in a room full of art. But somehow, that was enough.',
    
  },
  { 
    id: 3, 
     url: 'https://res.cloudinary.com/dsuutxrh8/image/upload/v1777736365/DD088ABC-A44B-4EB2-A0AE-0D98B1019972_1_105_c_adbvw6.jpg',
    caption: 'Late night calls', 
    story: 'There’s something about our late night calls that feels like a world of its own. The day would be loud and busy but the night always belonged to us. It didn’t matter how tired I was or how long the day had been hearing your voice made everything slow down. We’d talk about anything and everything. Sometimes it was deep conversations about life, dreams, and the future. Other times it was the most random, unserious things that somehow had us laughing so much. And then there were those quiet moments when neither of us had much to say(comfortable silence like you would always say), but neither of us wanted to hang up. I’d catch myself smiling for no reason, just listening to you speak on the other end. Time didn’t feel real anymore. Minutes turned into hours, and somehow it still never felt like enough. There were nights we told each other, “just five more minutes,” but five minutes with you always turned into one more hour. Sleep could wait. And even after the call ended, it didn’t really feel like you were gone. Your voice would stay in my head, your laughter replaying like a favorite song I didn’t want to turn off. Those calls weren’t just conversations. They were where I felt closest to you.',
  
    
  },
  { 
    id: 4, 
    url: 'https://res.cloudinary.com/dsuutxrh8/image/upload/v1777758293/photo_2026-05-02_22.21.08_gnaqvz.jpg',
    caption: 'Memories with Feyi', 
    story: 'I can’t even remember if class was cancelled that day or if it was one of those times we had to go and get cash for something but I do remember how you made us walk all the way to Access Bank just to take pictures 😭😂. All in the name of "keeping memories". You’re always saying "keep memories", and I’m honestly so grateful you do because now we have so many little pieces of us to hold on to. Like that one when you were roommates with Jewel and I was under your blanket 😂😂. We’ve made so many memories together, and I love that we didn’t just live them, we captured them. We get to look back and feel them all over again. I really love how we live and exist. Simple and full. I love you, Bim Bim 🤍. Cheers to many more years of keeping memories together 🥂✨ hehe',
     
  },
{ 
    id: 5, 
    url: 'https://res.cloudinary.com/dsuutxrh8/image/upload/v1777833483/photo_2026-05-03_19.15.27_hnojya.jpg',
    caption: 'Memories with Posi', 
    story: 'On this day, we had a call because I forgot my password yet again😂. Then right after, we spoke about me having to leave Quidax and I had said I wanted to give up. But you encouraged me and that pushed me to keep on fighting. I keep referencing this story because if you didn’t hold my grounded that time, I would have missed out on a destiny moment. This is to thank you again. I’d forever be grateful my girllll. For always pushing to do the things I’m too shy to do, thank you. For always having serious conversations in the weirdest possible ways, thank you. For making me feel so special on my 19th birthday, I say thank you again. Thank you so much my Bim Bim💗',
     
  },
  { 
    id: 6, 
    url: 'https://res.cloudinary.com/dsuutxrh8/image/upload/v1777836579/photo_2026-05-03_20.29.20_dvoq45.jpg',
    caption: 'Moments with Debbie', 
    story: 'This was Matric day, when no one came for any of us so we all had eachother😂😂 you and our roomate came to find me so we could take pictures',
  },
    { 
    id: 7, 
    url: 'https://res.cloudinary.com/dsuutxrh8/image/upload/v1777646525/memory4_gtrkti.jpg',
    caption: 'Our last date', 
    story: '  If I had to pick my favorite days then this day would definitely be one of them. I got there first, pretending not to check my phone every thirty seconds because I could not wait to see you. The moment you arrived, the whole place felt warmer. We had our conversations, took pictures and tried the zootopia chanllenge you forced me to do, I really liked it sha. The movie started, but honestly it became background noise. Not because it was bad, but because every now and then, I’d glance over to look at how beautiful you are. I remember how much you wanted to sleep but I would not let you. If I forgot any part of that day it would definitely not be the adventure we had at the end of the day, it was nice but babe we are never doing that again😂 ',
  },
  ];
const LETTERS: Letter[] = [
  {
    id: 1,
    title: "My Princess❤️",
    content: "Words can't describe how amazing you are, knowing you has brought so much peace and joy, from the laughters, to the fights, to the late night talks, to the dates, every single moment with you feels so special. At times I think back to how life was without you and I wonder why I didn't meet you sooner. The love I have for you is way more than you can imagine, I am rooting for you big time and I can't imagine how life would be without you, this is to many more years together, definitely forever, living the life that God has ordained us for. Happy Birthday my princess, I don't just see you as my babe, we both know that sooner than later you would walk down that aisle with me waiting for you at the other end. I love you so much❤️",
    signature: "Toyosi❤️, Assistant Birthday Boy"
  },
  {
    id: 2,
    title: "My Bim Bim 🤍",
    content: "I've seen you grow I've seen you push through, and I am so pround of you. This song reminds me of you and it reminds me of how far we have come. I love you my girl. You’re a breath of fresh air and someone I can truly call my friend. Thank you for always being dear(wordplay fully intended 😉). Happy birthday, my queen. Till we’re old and grey o🤍",
    signature: "Yours truly Feyi❤️"
  },
   {
    id: 3,
    title: "My rhemaaaaa ❤️",
    content: "Happy birthday my sweet girl. I wish I can give you the whole world because you deserve it. You are strong and I’m so proud of you so, so proud of you. Of how you show up and get the work done, you don’t make excuses, but you stay, and I’m so proud of you. I’m grateful for the friendship with you. I’m grateful that we are growing. I’m grateful and proud of the woman you are and the woman you are becoming. You have grown in wisdom and strength. I pray that in this new year you experience God more deeply and your heart for Him grows. You know the Lord, Rhema, very deeply. I pray this year you experience ease in all you do. All this suffering and stress they will pay off. It will count for something. All that God will have you do, you will do well. God hears you and God sees you. I’m super proud of you, my girl. I love you deeply ❤️",
    signature: "Stephanie"
  },
   {
    id: 4,
    title: "My Rhema",
    content: "Happy Birthday Rhema. I love you so much. You are such a delight with an amazing soul. I love being your friend and I'm super grateful to have you in my life. I pray this year brings you peace, joy, and everything your heart has been hoping for. I love you always.",
    signature: "Otokini"
  },
   {
    id: 5,
    title: "My Bim Bim",
    content: "Happy birthday Rhema, my sweet baby girl, to know you Bim Bim is to love you, I’m grateful for the friendship we have and for the chance to love you. I pray God grants your deepest desires. Have the best day my princess",
    signature: "Dum Dum"
  },
   {
    id: 6,
    title: "My precious Bim bim🌚🫶",
    content: "You're such an interesting person, I love love how you are a blend of compassion and 'hard guy' all in one package. You're a very grounded person and I love that I have someone like you in my life🤭. It took a little while for us to get where we are right now but I'm grateful for the gift of you❤️❤️. I cherish and love love you so so muchhhhh.",
    signature: "Deborah🌚🌚"
  },
  {
    id: 7,
    title: "To my princess of Jos",
    content: "You’re such a kind and sweet girl and I love you soooo much. I love how we’re soooo weird together and I’m proud of the progress we’ve both made on our character. I’m so excited for more progress this year and I’m forever rooting for youuu.",
    signature: "Ayomi"
  },
  {
    id: 8,
    title: "To Bim",
    content: "Xup bbg, you mean so much to me, no one can replace the spot you hold in my heart. You’ve been such an integral part of my relationship with Jesus, and you’d be surprised how often your name comes up when I talk about the people I adore. Happy Birthday, supergirl, yes you really can do it all!",
    signature: "Juloo, your housewife"
  }
  


];

// --- END OF PERSONALIZATION SECTION ---

export default function App() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [selectedMemory, setSelectedMemory] = useState<Memory | null>(null);
  const [currentReason, setCurrentReason] = useState(REASONS[0]);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const nextReason = () => {
    let next;
    do {
      next = REASONS[Math.floor(Math.random() * REASONS.length)];
    } while (next === currentReason && REASONS.length > 1);
    setCurrentReason(next);
  };

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
            Happy Birthday, <span className="text-romantic-500 italic">{RHEMA_NAME}</span>
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
      
      {/* Reasons Section */}
<section className="py-20 relative z-10">
  <div className="max-w-2xl mx-auto px-4 text-center">
    <motion.div 
      initial={{ opacity: 0, scale: 0.9 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      className="bg-white/40 backdrop-blur-md border border-romantic-100 p-10 md:p-16 rounded-[40px] shadow-xl"
    >
      <div className="mb-8 inline-flex items-center justify-center w-12 h-12 bg-romantic-100 rounded-full">
        <Heart className="w-6 h-6 text-romantic-500 fill-romantic-500" />
      </div>
      
      <AnimatePresence mode="wait">
        <motion.p
          key={currentReason}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="serif text-2xl md:text-3xl italic text-gray-800 leading-relaxed mb-10 h-[100px] flex items-center justify-center px-4"
        >
          "{currentReason}"
        </motion.p>
      </AnimatePresence>

      <button
        onClick={nextReason}
        className="group relative px-8 py-4 bg-gray-900 text-white rounded-full font-semibold overflow-hidden transition-all hover:pr-12 active:scale-95 shadow-lg"
      >
        <span className="relative z-10 italic">Click for a reason I love you</span>
        <Heart className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-romantic-300 opacity-0 group-hover:opacity-100 transition-all" />
      </button>
    </motion.div>
  </div>
</section>
      
   {/* Photobook Section - Bento Grid */}
      <section className="py-24 relative z-10 overflow-hidden bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-romantic-100 rounded-2xl">
                <Sparkles className="w-8 h-8 text-romantic-500" />
              </div>
              <div>
                <h2 className="serif text-3xl md:text-5xl font-bold text-gray-900">Photobook</h2>
                <p className="text-gray-500 mt-2 italic">A collection of moments that define you.</p>
              </div>
            </div>
            <div className="hidden md:block">
              <div className="px-5 py-2 bg-romantic-50 border border-romantic-100 rounded-full text-[10px] font-bold text-romantic-500 uppercase tracking-widest">
                {PHOTO_DUMP.length} Captured Moments
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 auto-rows-[200px] md:auto-rows-[250px] gap-4 md:gap-6">
            {PHOTO_DUMP.map((url, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ 
                  delay: i * 0.1,
                  type: "spring",
                  stiffness: 100
                }}
                className={`relative group overflow-hidden rounded-[32px] shadow-sm hover:shadow-2xl transition-all duration-500 ${
                  i === 0 ? "col-span-2 row-span-2" : 
                  i === 3 ? "row-span-2" : 
                  i === 5 ? "col-span-2" :
                  i === 8 ? "col-span-2 row-span-2" : 
                  i === 10 ? "row-span-2" : 
                  i === 13? "col-span-2" : 
                  i === 15 ? "col-span-2 row-span-2" : 
                  i === 18 ? "row-span-2" : 
                  i === 20 ? "col-span-2" : ""
                }`}
              >
                <img 
                  src={url} 
                  alt="Memory" 
                  className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                  referrerPolicy="no-referrer"
                />
                {/* Subtle Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                
                {/* Floating Accent */}
                <div className="absolute top-4 right-4 translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
                  <div className="bg-white/90 backdrop-blur-md px-4 py-1.5 rounded-full text-[10px] font-bold text-romantic-600 uppercase tracking-widest shadow-sm">
                    Moment {i + 1}
                  </div>
                </div>
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
        <p className="serif italic text-gray-400">Made with a heart full of love for my {RHEMA_NAME}.</p>
      </footer>
    </div>
  );
}
