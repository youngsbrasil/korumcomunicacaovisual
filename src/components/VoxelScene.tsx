import { motion } from "framer-motion";

import constructionScene from "@/assets/construction-scene.png";

const workers = [
  { x: 320, y: 220, delay: 0 },
  { x: 450, y: 310, delay: 0.3 },
  { x: 270, y: 380, delay: 0.6 },
  { x: 550, y: 250, delay: 0.9 },
  { x: 380, y: 450, delay: 0.2 },
];

const walkers = [
  { y: 340, duration: 12, delay: 0 },
  { y: 420, duration: 14, delay: 3 },
  { y: 290, duration: 10, delay: 6 },
];

const dust = [
  { x: 350, y: 460, delay: 0 },
  { x: 600, y: 400, delay: 2 },
  { x: 450, y: 350, delay: 4 },
];

const sparks = [
  { x: 500, y: 260, delay: 0 },
  { x: 650, y: 300, delay: 1.5 },
];

const warningLights = [
  { x: 220, y: 490 },
  { x: 680, y: 470 },
  { x: 350, y: 500 },
  { x: 820, y: 520 },
];

const clouds = [
  { x: 150, y: 40, delay: 0 },
  { x: 500, y: 25, delay: 3 },
  { x: 850, y: 45, delay: 6 },
];

const trees = [
  { x: 900, y: 130 },
  { x: 920, y: 170 },
  { x: 940, y: 210 },
  { x: 70, y: 150 },
  { x: 50, y: 190 },
];

const shimmer = [
  { x: 300, y: 170, width: 120 },
  { x: 240, y: 390, width: 140 },
  { x: 590, y: 410, width: 120 },
  { x: 530, y: 155, width: 100 },
];

export function VoxelScene() {
  return (
    <div className="relative w-full select-none overflow-hidden rounded-2xl shadow-2xl" style={{ aspectRatio: "16/10" }}>
      <img src={constructionScene} alt="Canteiro de obras pixel art isométrico" className="h-full w-full object-cover" draggable={false} />

      <svg className="absolute inset-0 h-full w-full" viewBox="0 0 1000 625" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
        <motion.g style={{ transformOrigin: "780px 60px" }} animate={{ rotate: [-2, 2, -2] }} transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}>
          <line x1={780} y1={60} x2={780} y2={200} stroke="rgba(80,80,80,0.5)" strokeWidth={1.5} />
          <motion.rect x={765} y={190} width={30} height={16} rx={2} fill="rgba(200,160,50,0.6)" animate={{ y: [190, 210, 190] }} transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }} />
        </motion.g>

        <motion.g style={{ transformOrigin: "750px 400px" }} animate={{ rotate: [0, -12, 0, -8, 0] }} transition={{ duration: 4, repeat: Infinity }}>
          <rect x={740} y={350} width={8} height={55} rx={2} fill="rgba(200,170,40,0.5)" />
          <motion.g style={{ transformOrigin: "744px 350px" }} animate={{ rotate: [0, 25, 0] }} transition={{ duration: 2.5, repeat: Infinity }}>
            <path d="M736,350 L752,350 L750,330 L738,330 Z" fill="rgba(120,120,120,0.5)" />
          </motion.g>
        </motion.g>

        <motion.ellipse cx={580} cy={380} rx={18} ry={16} fill="rgba(220,180,60,0.35)" animate={{ rotate: [0, 360] }} transition={{ duration: 2.5, repeat: Infinity, ease: "linear" }} style={{ transformOrigin: "580px 380px" }} />

        {workers.map((worker, index) => (
          <motion.g key={`hammer-${index}`}>
            <motion.line x1={worker.x} y1={worker.y} x2={worker.x + 8} y2={worker.y - 12} stroke="rgba(160,120,80,0.5)" strokeWidth={2} strokeLinecap="round" animate={{ y2: [worker.y - 12, worker.y - 4, worker.y - 12] }} transition={{ duration: 0.5, repeat: Infinity, delay: worker.delay }} />
            <motion.circle cx={worker.x + 8} cy={worker.y - 4} r={3} fill="rgba(255,200,50,0.7)" animate={{ opacity: [0, 1, 0], scale: [0.5, 1.5, 0.5] }} transition={{ duration: 0.5, repeat: Infinity, delay: worker.delay + 0.25 }} />
          </motion.g>
        ))}

        {walkers.map((walker, index) => (
          <motion.g key={`walk-${index}`} animate={{ x: [200, 600] }} transition={{ duration: walker.duration, repeat: Infinity, repeatType: "reverse", ease: "linear", delay: walker.delay }}>
            <circle cx={0} cy={walker.y} r={4} fill="rgba(60,80,150,0.4)" />
            <rect x={-3} y={walker.y + 4} width={6} height={8} rx={1} fill="rgba(60,80,150,0.4)" />
            <motion.rect x={-14} y={walker.y - 2} width={28} height={3} rx={1} fill="rgba(180,140,70,0.5)" animate={{ rotate: [-2, 2, -2] }} transition={{ duration: 1, repeat: Infinity }} style={{ transformOrigin: `0px ${walker.y}px` }} />
          </motion.g>
        ))}

        <motion.g animate={{ x: [-80, 1100] }} transition={{ duration: 18, repeat: Infinity, ease: "linear" }}>
          <rect x={0} y={100} width={30} height={16} rx={4} fill="rgba(60,120,200,0.45)" />
          <rect x={22} y={96} width={12} height={12} rx={2} fill="rgba(60,120,200,0.35)" />
          <circle cx={6} cy={118} r={3.5} fill="rgba(30,30,30,0.4)" />
          <circle cx={24} cy={118} r={3.5} fill="rgba(30,30,30,0.4)" />
        </motion.g>

        <motion.g animate={{ x: [1100, -80] }} transition={{ duration: 20, repeat: Infinity, ease: "linear", delay: 2 }}>
          <rect x={0} y={540} width={28} height={15} rx={4} fill="rgba(200,50,50,0.4)" />
          <rect x={20} y={536} width={10} height={11} rx={2} fill="rgba(200,50,50,0.3)" />
          <circle cx={6} cy={557} r={3} fill="rgba(30,30,30,0.4)" />
          <circle cx={22} cy={557} r={3} fill="rgba(30,30,30,0.4)" />
        </motion.g>

        <motion.g animate={{ x: [-100, 1100] }} transition={{ duration: 24, repeat: Infinity, ease: "linear" }}>
          <rect x={0} y={535} width={40} height={20} rx={3} fill="rgba(30,80,180,0.5)" />
          <rect x={30} y={530} width={14} height={16} rx={2} fill="rgba(40,90,190,0.45)" />
          <rect x={5} y={539} width={22} height={8} rx={1} fill="rgba(255,255,255,0.7)" />
          <text x={16} y={547} textAnchor="middle" fill="rgba(30,80,180,0.8)" fontSize="5" fontWeight="bold">KORUM</text>
          <circle cx={8} cy={558} r={3.5} fill="rgba(30,30,30,0.45)" />
          <circle cx={36} cy={558} r={3.5} fill="rgba(30,30,30,0.45)" />
        </motion.g>

        {dust.map((cloud, index) => (
          <motion.ellipse key={`dust-${index}`} cx={cloud.x} cy={cloud.y} rx={15} ry={6} fill="rgba(180,160,120,0.25)" animate={{ opacity: [0, 0.4, 0], scale: [0.5, 1.5, 0.5], x: [0, 20, 40] }} transition={{ duration: 3, repeat: Infinity, delay: cloud.delay }} />
        ))}

        {sparks.map((spark, index) => (
          <motion.g key={`weld-${index}`}>
            {[0, 45, 90, 135, 180, 225, 270, 315].map((angle, sparkIndex) => (
              <motion.circle key={angle} cx={spark.x + Math.cos((angle * Math.PI) / 180) * 6} cy={spark.y + Math.sin((angle * Math.PI) / 180) * 6} r={1.5} fill="rgba(255,220,80,0.8)" animate={{ cx: spark.x + Math.cos((angle * Math.PI) / 180) * 15, cy: spark.y + Math.sin((angle * Math.PI) / 180) * 15, opacity: [0.9, 0], r: [1.5, 0.3] }} transition={{ duration: 0.6, repeat: Infinity, delay: spark.delay + sparkIndex * 0.04 }} />
            ))}
            <motion.circle cx={spark.x} cy={spark.y} r={4} fill="rgba(255,255,200,0.6)" animate={{ opacity: [0.3, 1, 0.3], scale: [0.8, 1.2, 0.8] }} transition={{ duration: 0.4, repeat: Infinity, delay: spark.delay }} />
          </motion.g>
        ))}

        {warningLights.map((light, index) => (
          <motion.circle key={`blink-${index}`} cx={light.x} cy={light.y} r={3} fill="rgba(255,150,0,0.7)" animate={{ opacity: [1, 0.2, 1] }} transition={{ duration: 1, repeat: Infinity, delay: index * 0.3 }} />
        ))}

        {clouds.map((cloud, index) => (
          <motion.g key={`cloud-${index}`} animate={{ x: [0, 30, 0] }} transition={{ duration: 16 + index * 4, repeat: Infinity, ease: "easeInOut", delay: cloud.delay }}>
            <ellipse cx={cloud.x} cy={cloud.y} rx={25} ry={10} fill="rgba(255,255,255,0.3)" />
            <ellipse cx={cloud.x - 15} cy={cloud.y + 3} rx={15} ry={7} fill="rgba(255,255,255,0.2)" />
            <ellipse cx={cloud.x + 18} cy={cloud.y + 2} rx={18} ry={8} fill="rgba(255,255,255,0.25)" />
          </motion.g>
        ))}

        {trees.map((tree, index) => (
          <motion.ellipse key={`tree-${index}`} cx={tree.x} cy={tree.y} rx={14} ry={12} fill="rgba(60,140,50,0.15)" animate={{ scaleX: [1, 1.06, 1], x: [0, 2, 0] }} transition={{ duration: 3 + index * 0.5, repeat: Infinity, ease: "easeInOut" }} style={{ transformOrigin: `${tree.x}px ${tree.y + 12}px` }} />
        ))}

        {shimmer.map((item, index) => (
          <motion.rect key={`shimmer-${index}`} x={item.x} y={item.y} width={10} height={18} rx={1} fill="rgba(255,255,255,0.4)" animate={{ x: [item.x - 10, item.x + item.width + 10], opacity: [0, 0.6, 0] }} transition={{ duration: 2.5, repeat: Infinity, delay: index * 1.5 + 2 }} />
        ))}
      </svg>
    </div>
  );
}