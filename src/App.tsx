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
    url: 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wCEAAkGBxAQEhUSEBIPEBAVFRYPDw8PDw8PDxAPFRUWFhUVFRUYHSggGBolGxUVITEhJSktLi46Fx83ODMuNygvLisBCgoKDg0OGhAQGC0lHx0tLS0tKy0tLSstKy8tLS0tLS0tLS0tLS0tLS0tLS0tLSstLS0rLS0tLS0rLS0tLS0tLf/AABEIALcBFAMBEQACEQEDEQH/xAAbAAACAwEBAQAAAAAAAAAAAAAEBQECAwYAB//EAD8QAAIBAwMCAwYDBwEHBQEAAAECAwAEEQUSITFBE1FhBiIycYGRFEKhByNiscHR8FIkMzRygpLhRFNzsvEV/8QAGwEAAgMBAQEAAAAAAAAAAAAAAAECAwQFBgf/xAAzEQACAgEDAgQFAwQBBQAAAAAAAQIDEQQSITFBBRMiURQyYXGRBqGxQoHB0TMjUuHw8f/aAAwDAQACEQMRAD8AWW1c+wwSCGqMUQF90K01DQpuOta10LUZimMqaBkUAepgRQBFMCTQBFAHgKAJoEWFAyRQIsKAJoA9QBYUCJoGTQItQJkgUxF1FMRcCgC4FAF1pAbR0xhKCmMISOkI3SKkILiTArLqZYQ0Fwrx8649Ud8xsIEVdyEcIeDjrWsNi5K5BZFKKIAV4tXwJIS3HWtaLUZUDIpgeoA81AyKAIAoA9TA9QB4UCJoGSKBHqALigCaBHhQBYUAWpgWxQBIoIlqYi60AXWgMmgFIDRRQLJtGlA8hUS0BkMjFAzdBSYzfHauXrLOBhcQqrRw5yARXXQzh7M1isXJVIPxSSIA10nFWRGIrtea0roWxB6kM9QM9QB40DK0xEUhnqYj1AE0DPUCPUASKALUCLUwJAoAtikBNMRWSdE+JlXy3EDNA0m+hEV9CzBfEjVjwPEYRL/3PgD6mmgdcvYOngZG2urK3XDAg4PQ+oPn3plZCLSA1UUsjNFWkI3SOgQQiUAbxrQMISgZvEMmoTeESQQBzXE1UsywM3hNbtJDEQRuGrbkZwmnNms9i5K5DYVBFZlMtTQCO/jq+LLIsAqZYeoA9QB40AVNMCKAPUDPCgRagD1AHqAPCgCwoEWFMCwoAzublIxlzjyHc/IUmSjFvoJrjV3cgDdHHkBmVd0mO+ORz6frUclyqSDdFtbVxMLl7sK3/DmO3ikm3AnaZS/wjGMhW586N8O7LPLk+iH37PZLi2/EiK0t7yNoszW9x4aM6LnlM5LdTlcHqKsrcZcIhZFxw2A6fPcSFVEapaySSm3QyKfAcAyGFMncq4wAp4JIxyTmTz1wV2JNfVB4FQM5qopCN0WlkAiNaMiN1WkM0UUZA2UUZJILt171nulhEsFmauM/VYPsXibiu1UsRA2D1bkDgdNk6VXYiEkPozxVRUQ4qSEhXfx1bAmhK4xVhaRTA8KBnqYHjQBWgD1ICcUwJoAigD1AE0ASKALCgRk0sjuIbeN5p2YIFRWbDNnAOO/B+x8qCyMM9RlZ/s5v7icxja0i7RdOzERQMeTGWAwzAY4X/Vx5ibrSWWycbOyRjqWkrp07QSNHLOMDdGC3XPuqOoPmBnqOTWe2qecRNdVkNu5govWY+6kpx191U/8AtzWeVe35i5T3co2hlZW3PbxzgA4SdmkjyRjJXHOM5A+VTqnGEskbIyksA96sls3hWslnIRi+S4jCLIkkYzt3uAwYbc7DwePWtyzjEcGFrn1DkRsMBhtYqrEcHG5Qw6ehFVPgySWGbxrUciCUSkMJjSjIYNlWmGDQLSySwXUUNjwGKMCsOpnwSB5G7Vj00d08gy4auwhE76YHAWcmDRNcCkdLavkVQUPqbNTECXUeRU0SRz12mDVyLUzCmMmgZ6gD1MCKBnqQEimI9QB7FAE0AeoAlaAFOqapjKRHnozjsfIevrS+hbCHdneeyf7QLK1it7eC2khJkEdxcbkeQ7gA0qtjLOxOBkAKBxVsEnwOSfU+zQQOUCjFpFjhEKvOc8kluVUnnJ94nOcg1Do/cOqALKHT7ct+FgWWYk+I8MZuZmfv4s3OD/zsKl6m8t4/YXHRIT+1Hs/faj7qQ2tpHxmWYq10cHOAIlIVf+vNKexx25JVuUZbjg/ar2FubKMStLbTR5CsSpDIT04Z+n/is064wWUaq7nN4fAmmaRxC0F0sc3gTRXAjh8JILeNTty0Wdyv0LHueelaq3uisGexbZPJrYxMscYdt7eHGxb3vzRqwHPPAIH044qqXUyT+ZhkYqJEJSkMIjoA2WgZcUDNIxzUW+CSQVIcCuXqZDwA7smrtJDCyJlt9bhHt9PIHAK2DVgM6DS5cis8lhlM0NKRExlWpIaEWpxVbFk4sW1MmezQMmgCKYE0DPUASKANUgJoJKISlmaWSSgeNrSyPYYSwYppkHEBglimuEt3mEEbNtmnwW2r3VAAcueg7ZNPqSjDux/rZ064uIdOslSOMsEuLkFWRIY8uUjY/G+QzM/cnAyK0ww/QQknHM2ch7VW8EN1JFasGgQgJIHLn4Ru97H+rNQsSjLESytuUeRnY+2d9I8EU144gR0VjIFZPD3cmUbT4oxnh89Ke/LDYl2Pq2oftksIhtgSecDhfDjEMXHq+Dj5Co+XH3I5l7Dz2P8Aae41WEzRRw26h2jxMk05JHcHKAj5E+VEowj7hmQFrug3t5L4VzdxRwBd8MdvbFC7Z94uGc5I4xz9qbjGUeBxm4PJwesWurtJdNBcLIkZGms4VYfEVyqiKOMe6ACyg4xUcSWcEm4vBgN3RzucAKzZ3ZKgL1+lZ2zNLlmqUhG6GkM3Q0DNgaQy4NIDeA81Cb4JI9dS4rm2eqWCQIrV0ao4iQM3kqwDPx6AOONXgM9KmwapmiuaOiQ5qoqIcU0CFl/HkVZFk4nPuMGriwigZNAHqYFhQB4CgYVbQZoZOMRvb21QL4xDBbikWKIPNDigNoi1PVLeKVEn8Ro8gzrCQJPD/wBIPYt0z1A58qlHryVzXscfq17+ImeQRxwhz7sMY/dxIMBUX5AAU2+7CMexnHaSNwqM3ngHA+dVyuhHqy6Omtk+Isvb2EpkWPb77HAHlUZaiEYOeeETjpLHNQa5Z0T+yEijgAnpuZgq/Poa58PFYN8nSn4Vhenr9RJJ+7YqWUkEqcAn9a7Ndu5JnGuq2NrPQ7L2D/aPLpyNC6PLbk70VZPDeJj8W0kYIPXHHOfOrsxkuTM010Ok0v24sr2aWbUZpIlRNtnbLNcZyc7m3Rke90+/pUXGOcrHA05JYA4tQ038NaqJ7sXLSvLdKLi6KtIqSMm4M2xmMghwevHWjOE1kJNvkDWseSg2Q0gNVNAzZWpAaq9IkXDUAFW54qi1k0gO+k5xWWtbphIzL4rooiDyPQBgWpCOcrSBtbPgioyWUJo6eykytZyhoIagAS4TNSRJHO3seGq5MnEHqRImgC2KYE4pgaRpQNIZW4AqDNMUMrdxSLki8lyBSJCnXdZWFM8FzxGvmfM+g/zrRgUng4e2tJLmTOSxY7ix/Vv7VTfqI1LLLtNpJXM7PSfZ6KIcqHbzPY+lcHUa6yfR4PR06OqpcLkZXk0VvGzEL5YAAyewFZaozumoousnGuLkzk7LeJfGkmgt3k4TxPedVY43bfyrx8TY6Gu461OKqjFtLv0X5OM79k3bKSTfRdX+AiZIpbmOBrsTq5CG5aSSOzjY54yEyfLjjJ6961U6TZwtq+yz+7MV2u3c4b+7x+yL3mm21neta3ohSADctxCklxuyMoSvi5APIwORx25rT8O8+qb/AIMvxSa9NcRg3seLm3e7hgkjs1LbZo3ikdo0PMngOVZF4PBdm8hjrONST+Zlcr8rG1HPwx21ldJKGt7+3BLCOQPFvUqRiRGU7GBOe4O3gmrFiLK2t0fYdaFpWmtDHMsgN6vjTSwghkRQ3hwqBjHxSRtnOeD5cE1FRyitylzkPU1kZUaqaQzQGjIYLhqWRmqvSGaI3NA0g5TgVjukTFkrZajTR7kG+SjGtgijUCMGoEc/WkZGaQD3SJ+MVnmsMqkhvmkRMJaaGJtSjq6JKIrqRMkUwNBTAsBTA2Sky2CCImqBpSPNdkUEslHuxgknAHJJ7AUA2cqzPdy5wcE7UXyT+5P9fKq7rVXHLLKKXdPB3emaWsCYwN55Y/yA8gK8tfqXbPPY9VTUqo4RN3qSR4HvMzHaiRqXkdv9Kgd6nRorbeUuPd9Cq/W1U8N8+y6k3PslPcRtLcsLfCHwICQdhx8cpHAPoPvXTp2afEYrLfV/6OTfbPUdeF7f7NdK/Fa1FB+LSBbO2OIvAjMRupFyu4nsnXOMAkn6dS+7y4cLlnKqq3Ty2dDqmj2iwE3KwJbr2cBUXyC+vyrlQhdKW6DZ0ZTrjHbI5XQdGkjkna2tbf8ABzL4edSgLtgZw8UfDqCT3wDx5V1PPdNf/U6mB1K2fo6AEGmnTZxJdxG9sSCJI1yqBzjDGMnDY8mOOaem1sLXh8fQWo0koLKBPZtreQ3cMNtJPcSyeNpphiSSSIoXYK4zgJtxkZIOSK2Jx5MrzwdPf+0niqsAtlgjW2SKLAIKbJU8eN88hleJVx6Z/MKjc/T9yDWELVNYyJopoGX3VEDwakM0VqBhFueaUuhKIZI/Fc+15eBsCxWypYiVFWFWAYuaaBmJNSFkQ1pAoaiAZp8u1qrmhM6KF8iqios9SQ0AXkeRU4khHIuDVpMqooA0AqQi6igaNBVbNMUW8TFIuRi7ZpgJtcujgRJ8TnH0z/f+RoItnXeyOglFDEZY8IPIDgk/55+dee8Svc5eXE9FoalVDLG+rfu2W3iX8TeyjKwhiIoYu8kpHIX/AD52aDw/ct8uiKNb4i4+iB1On6X7wlmIluQvhh1QJHEn+iCMcRoPue5NdC612PZWuDm1Vqtbpvk57XL5L64Nl46RW0S+LqNwXVF2DpArdiSeT2wfLFadLpNvql1KL9TlYiM49UeRFj0q3UxAbEurgPFZqo4Hhr8cv2APnU50LO+1kY2PG2CN7L2fXeJrp2vbpRxLIAI4f/ihHuR/Pr61B3N+mpE1V3sZe71+yRini+NL3itI2vJs+uwFV+tVfBTseZss+KjBYihTrNpcXsbItqtujDBkvpw02P4I492D6EihaOumW/d0D4mVi246iKSG4hvLeSa4jtEji/Drd2cCw+HtUhDKHJBU5wWIx06dRfRrK7Z7HwVW6adcNy5AvZnS7i6X8TNc7xcSXSeEoU7r9IzMDxxiQRtyAOi9eK0yjui+TLP2IVqxFaLhqQyS9RAlDQM3WpAbQnFQseETighmzWFLdIUzI1uXCKyjGgDBzUkJmBapEciOtJIiogSjYNJgzoNPlyKpwVtBxoAHmXNSQ0JL2PBq1EkDrUgL0wNEpMkjzHFVyL4szkbikWZAnmxRkYPoNr+JvB5Jx6Z5/wDI+oqNkttcpPsidEd1iR9ZnuVtoXkAJSKNnI7tsHTPqQB9a8/RU77lnoztX2+XW37GNmYdLgNzfyKl3cgTXDYHiEkZWCJepVRgeWep6V6G2En/ANOPCXc4dc4r1vlgx1PVdRG2zj//AJ1m3W5n4uZVPdQOQPlj/mq6CrpXH5K5brHmX4CrP9n2nrE0bQyTyMCGuZHIdWP5k52qc+h+tV/FxT4RP4eT7jdtO1DaFa5ikVVKgR2winYflJZnZCfmmPlUbLo2NPH5JQrdfcWTRWW4R363Cseg1G4mW2cj/SExbk9eBV0Va1wkVycO7Y4Gt6VaLtN3YQqBxHbgPgAdMJ/ak67X1kJTgukTA+22lN8Nxct3Jjs5mH6R1XLR7u5OOpa7Cn2j1/T3iKiacByIi08NzCke44LNuQcDk/SsvwDjamnwalq04NYOQ0KyswLuRLx/GtZPxFihdIobyKJmJ4xneyLjAI+PvzXWisYwc7Oeow1+COK4kWFg0JIkiIIIEbqHC/Tdj6VhsWGVtYFxkqtgeVqiBvHTQBKmpDR6J8mqLWXJBxHFV1R5yUyfJixrQIxY0hGTVJCMyKsQhC1aBnhSA8aQMZ6ZL2quSIsdKeKQijimgFl/HU0SQsWpgaCmBdaAJk6UnHJYpC+4nVfiOB25Xcc5xhSckcHnGPvSVabxksTbWSt54SZUS20rjM/vSyxobdV3BCMDLyqykBXyu0jqeBwUXgabYy0VoZJoYZLq2t4blYXmltNqywSICIg5ce77yJuGc5IYk1OSjOLi8YY45i1KPVDFZJJYjFJd2wja7aykuhIN0kUZ3LI0J4wwA2sDjoO9Za9EqpuUXwuxpnrPNhtkufc6m1j02KTxnmt57jvdXt3FJN3HugkhOp4UKOalJXyfsQXkxQ5XW7Y4/wBrswT0/wBoi5+WTUPhLH1ZL4mtdCJdbtAMvfWgA4/4lD5cYB56j70fBzD4qPZC2b2vt84t47y+/jt4nFsPnIee3YVfHSJLLZU9Q28IT6xqF1eFEv7Se101P3pjgQzyyOvw+IV95R1PAH9Rpgl0KHnr3Gmh3GhsxFubBHPBWQPA/wB5F61XKNufS0SThj1JnXfhCBkRuRjIaKRJBj5HHFZ7J6iJfCNEhB7QWkU0bRyNhWBUrKDF146tx+tci/UW7k89DpU0wSxg4GztRqV7BbXjLBHbQOjzI21p1iGd27jDHg45+FsV3oS82KeDkTj5TaMpbNbdY4l3FlijMxbqZnXxGGO2N4XH8PnmqL2t2F2KJPLMC1ZxGkdABUVMDSV8CmSj1J073jWeXJe+ENJKsguDMzFhUgMWWgDE1JCIxViQHPGrgPUARSAItHwaUkIfwPkVAiamgYLcpkVJDErrg1YBIpgWFAI8Iy5wBwOvlny/z0oyGQpIvcaNlR4naNpVZclljcPhG6oSNy7h2Y/OoORZGW0BmtkQop2QRC5NzFKsZeS1zyVU4O9BhMBu69ealFpolGeWZ2lvK8BVEcIbiFkae3t38XVHCeJHJKp3JDsd2GRg47GpRLGuRxYrLLI0/wCHsmuvBmvJo22z20sFyyoiRxhsRlVDttJ7jpk1LKUeew4wcmkjpba40zYGu9OtYVP/AKmO0We2znGHZV3xHzDqMYPNZVKT4T/JdKGOqOg0/wBndHuVBhttOuF87cQu31CkH71J2XR6ohsrfRl7j9nulSAr+GWJjxuiMkUg/X+lOOq90J0PszA6fq1ioWAx6jbqAFjlIt7tFGOBIPdf6jNaPMhYsZKNkoFYfbOAP4dwZ7CXsl/B+7JHXbKvBHXmqpaaS5iy2NyfEkNNQ022uUDXFrBOhGVniRJ0we+R7w+lVu66v5lkmq65/K8CdfZhIP3lhcXFrjtBIZoCf44ZMgfpTWtrxyJ6SWTn9c9obzxYrS5OUkO1rmxgkad4wDv2w84bHPGcc+VVRVGosyu3Ytl5tEMe4n0PSNMmivvFLLOsoSzieR422NIVGV43ydmBHHkMmuhtSfCMe5vqR7RbfxU+xtyeK5VsYyCxPTArnW/MyvAuUVUATGhpoAuKM1JIDDUGwMUpcIurQdo0fGaqSJz4QxZatS4M5QrTwIxdKMADstSSGVxViI4ObqwDxoA8KAJU80hDqwlyKhgQfmgDOQcU0MUXkeDU0AOD9+gHrTGkHQ2h47sx2qD0z5/IDJqqdqQhibUIoA6Zwx7nPc/M4+9ZldljRV1qUZZAEvF+HGPiGQeQVOQQR3BBxWiHKafsOEnGSaPCGBmPjpJKjPGzxiaRF2xqFGADgttXbk84z5k0R3Lqa3ZF9FgraOLVYmgUb1X/AGke8bd3m/3g6Dbu8NfdXAXaMA9SRkpSeVxguy4Ri4cv/wB4DbT2ghV90cv4aU8tHMd8E2BjaXU88YAbCtwOGHu1kdbguPUv3X2Nitjb19Mv2f3Gsdvpt2ymSL8FdH4JYmMDM/mkiYEh69Ru/hp16h/0vOOz6hZpf+5f3XT8jqGHV7b/AIe6jv4lxmC/UGUDpjxV97Pzx0q5aiufEkZpaaUeYsYaf7cwBhFexy6bM3Cif95auf4Zhx98VN0Z5gypylH5kdHfWcFwm2aOOaJhkEhZYmHYg/1qCusreGJ1wnyjkx7Ly2DeJpU5izybO5Z5bOXzw3VT61ohqa58S4KZUSjygm31+3uCVlBsb9fjhdgpYDq8TdJE/wAIrHrdOsb4GrS3PO2RwftfrjRywzwBlmjZ2iuDC/gSqytG+Aw974jyuRS0GntpbnJcMlrLq7FsT6AunaBYzW0U5nkkuWZ7rUHWQ+5EpP7raON0kjRqM9csRwK6ckktxz92ANo8ngBR2Vc7VHYDPOBXOllvJWbxQUtoBccVSSAJVaswApu/efFU2GmtcDyxjwtJIhYwkLUyo8UoAzdKeABpI6kgMdtWIWDlxUiJBoA8KALUAHWEmOKhIByhpAeNMAC8TNPIFdOs8nJHPb0qq2zahoZ2aZeQn8hES/8AarMfqWA/6RXPuseF9eSWBvZaNLcKSCEjKttkPvBmBxtAHPXvjtXMv8Rqokovl+3svc1U6WdnPQbap7ICZmZZTG5weEyhbABOM8dCcetc7S+PeTFRnHd1/HY3W6ONj3Lg9dez1sQIVj2Mzq5kBLusSYyQxPu7iAMfxnrjhV+MalSdzllJNJdFl/zj/BZ8FXtwkAat7HD33gYjgGKE+8SRw2WP6Vt0f6jfphevvLp9uCqWgWfQxeulrbEeJGWbzkUYB77RUrvFJ6jit4X0/wAnf0HhtMVnOWIfaNA8rKQB7q8qACDtBH1Ga7nhfOnTfV5PP+MTxqWl2FVsoAKfAR8Sr/u2B/NsOVwee3nW2dUJ/MjDXqrqv+OXHt1Q407W72HiIiZe0TFwV/5GGSv049Kz2URS9Uvz1/Jup1zm8eXz9On4Ovt/aN502XNm7ow2ukwjJwfqQw+xrnPXKh4U0zrLQK6O7Di/ZgqCbTiZtNlJtydz6fcktAe5Ebn/AHZ69fPqRXUq11V0fUcu7w+yD46nUaT7Q21+p8ImKYDdNaTrtYeo7Mv8S/Wq76FjfB5RVCcoy2zWGcf7VXFmRKbiNpEELNZ8yIrXSnlY5lG1uGB74wcir9DVKEZSmupXq5puKi/uKYJb1YdOk1OBZbGNgsEcaBp5InG4K8eeRtQEDyHNb8tJvuzJhN8Bur6nDK0j29vHAZwvi4QI6xIR4cWFOPyqzHueBwvOayeVtRCUuwqVKowRCI1owBuoqaQEzHCmm+EOKyxbbJuesz5ZqXCOhiTAqaRnk+S+KZEsBTwBVlpgYyCmkAKwqxAcjTIkGgDwoEXAqOQNYDg1FgO7d8ikhmppgVWHcaUnhAxrZ2gFcrU2kU+R9pWiRk72PJKylUPHGMbwRzkACvN6zxOaWyPTlf8Aw6+n0iaUpfcdzERAnLFscDsW4H347+ZrjbnY8Y4OpXXuZLzHHY54OPU+fmKioLJNQ5FxkjyVXK72Z2O4lmYDA5PIwO3bFasTay/6VhfQvjBx5CJLk4wp6Dt51Sq1nLFGtdWASymTPiANhsjgEAYq+Mdny9zVGOz5O4jvdIt5HZySWJ3FckDp2rtafxTUU1xrilhdyiXhtNkt9kW8/Uxh8KP4I0HG0naC2PnUbdRfa8ymzo16CqCxGKRdb3B2QRZ6Z2+6vTPvdhVU4ymt1s/yCphXxj8Gd+0ijJTjvsy5H6UVbW8JmqnY+MiyPXGX4d4H5sjOf89a6NcZQfU0WaWqxNSwA6te+IYTHGkI3EzXUCM1wDzgxpnCZ+E9Rz5V6TS7fLTise5898RjOrUSqm87eg9XUlup0Oqp+Iiii8Gzt4TGkPidN1wVbahxjlSVGO3Q7YyWMLhnMeM9Qaa6lU4MwmCIYrfG8paRNkNHEzYLnYQhlZQxAIHBOYWWZ4QN9kBAVRgiXVaWANkFPAghVqSQzDUWwtRn0LKzHS4+aoSLpdB6oqzBmbJxRgCwFPAGcjU8ACSvUkIHOTUhnKGmRK4oESKiwLrUQZcUmIY2clJEg8GgYysIKz3TwiuTGhXbXE1M8oIM6Jbp1jDHax7BchRnoK8lKuMrMHraIOcVu4Ft9qhTOFBYFeMkjJ5/z5Voq0+7HPBthUscsynvCApLKvRio5yGXv6jj7GrI0ptrH9yyuly6IV3OpDnbxzuz3+nlWmFDWMm+rSYxkxGskAZ6NxnPSpPS5fHYtejTfHYVXmuiLLI2/HGzbnI53Nu7Y4rZVo96xLg59+vqrltxnHXHYFf2g3LuVWGe5HQ1YtFh4bNVGu0klzLH3M9Nna6k271QjnBONw74qdsI0QzjJdHxHTvMK+WdRczTQplEiKqOVBbcB59s1l0lOm1FmycpJvp0wcXXX31xdkEmu4vf2gLDDRgeqsf5Guq/wBPxj8lj/ujl0+OuL9cPwxZfXBkBAAAPmSPvipV+FWwa5TOpD9QabGWmYxpgADsMV3K4bIqPseU1d7vulY+7NlFTM2CwFICwFLAGiijAGyLTwATHHTJbGA6mnOKpk8miFeFkJ02DiksCnFtDHFTwZnwSBTwBbbSyTUGwWfNGRutoyiti5obK84GUdlgdKjvIOR84NXBk9ikMnFJgSKiBdaQgm1ODSGhvb80pPgbOh06PPr8q5eosRS05dEMmth1c7U7nvj0rham9Lhcs6Wh8NuufKwiZdRjzgEnjAX04H3rlxpl1Z6+vSSjFL2Fl9rNsnusf3itvK5YlWx0OB6DjNbIae2a4XDK24RlzIEvNat5VztKsAchduTnoanXpLYPGTI/E5US45Xsc1qc5B9yQMp6YyGHzrpUwTXKOrV+odPtW6LyLbxnVc5J/kK01qLkYtb+oZTg41LGe4Bpk+ZOenQjqDmtFsPRwedhdiXL6hxkVgyDHuHjBOSOnPb1qpxcWm+43bhNBbQxrAskQZZlYMx3scYOGx6d6oU5O1wl8rOzCqEtJ59S9S+vTHU6a2vvE93qeQflg1hqo22pr3OnrrIVaeU5d1/IrubUrXsK7VM+fRlkHFWlhdaANFFIDQLQBdVoEaKtABUCVCTNNVeRgiACopl8q8Cu5Tc1Qm8Eq45G9lb4FU+ZyafI4LSx1ohIwXUMmGGlOzA6dM31NmirNK06UNKkVSxJPNONhRfGKQZBY4qe44lj5ChCBUclGT48EreW5J20YDJ4rUWgySq1FoEzVI6Q8jLTtOMhySEQfFI3Qeg8z6Vk1WqhRHnr2R0NDoLdVL09O7G63ccfFvC0zf8AuMpYZ/l9q4lurus+aW1ex63T+Daepevl/kKivZgC0vB7Rg8D54OK584xm8J5OhHTVdILAJqGsHIBOBnGAe1OrSrGUa6dIkm8GlrqKDEnQfl46+tRnRL5Tm+IaiNC8tvlnLalcvNOzNjLHgqMAjoARXVphGupJdjznmNyYttLaWfe6kgBjGo+WOvpWmycKsRa+pgcZWNs3trdlJ8X4UDH3T8RHbNLiXy9xyr2xbYVcpuQY6H3h/I1Vhwm8mVT4ALK2CyZ9Qf1rVuyimUzXw1QkN8LYGeyscn+1KyLwmuxZB5QygsAQA2T6K3ulfXzq+imDr3zWGbI+I201uqHRnS2MYUYUY88da4mtkoP0nP1Gruv/wCSTZXUIciuroLMpGaDEmzBrtJmlGipQBqqUAaKtAmaBKYiypSY48sMgWs8mdKpG8kmBSjItnEGhTcayai3Bt0lGVkeQgAViV3J0HTweKVpV/Bnlpsssi1GV2SUdOo8hkVuKUOSi+zAUkAFaEjh6m89KwUVLJypyF8k3NRKHI+dSacV6V08mpNArQkdqYmzFlowRyaxR1FoaYXFASQPMgfeoSeFktri5yUV3eB1bzRk7MAouQiHoQuMsfvk+teWsjK6xzk8fX/CPpD070lEK6Y5bwv/ACzebUhtyCoA4yBjHn/I1jnp1v8ATn+5qp00lhT5YttA93IY0ZljC/vWwDjOduM/KtcKVFJtclPifiFfh1W9rMuy9xRLYN+K8AOXG7aXC8gYy325+1aJTjCtzwcmX6ls8veoY4HPtGJQkUEAUK3A3AZ3LjaMnp1JJ9Kx6LbNyss7Hm69VZa52WPlvk4u5kdy2dyToSrAHHI8q7EYqH1iyW/PIy9iLwI5hf8AOdyEn8+ORn1wP1qrW15SmuwU2YeGae092qyCBDwvvS4/NIecfTj7mrNMnt3S6sq1Nrk9q7Fre4DR9OV4HyP/AOVCzD5MSl2NLAAt0HOTk+XSpUptpEGwyXS1kK5ztBLvx16BVz9CT8xWtrdPHZF0eIjW1tvpVer1CjHBVJjADaK8pZNzlllbM2OeK6Wg1Gz0sh0YtubfnNemps3I01szSOtBM2WOmIuI6ANFSgRokNQlIuqrbYSsVYLbcHc02n3GNzHVCv4NUtJyetuDXJ1WoaZ1aKFGIwSSsMdS0+SbgaiWtHxaXchsDbOPNX02b+hmvlgZImBzXVrXB5rW6jHBDyVccOU22AXMuaRRJgDvzQVMDNoK3JmnIJc6aD2qeR7hNcaXg1LcHDLQ2OKMkg2G2wQfI5qqaymi2uxwmpLs8i6PRJhKWDKE97b1JJPQEdvn6Vy5aN4we3l+qacRlteeMr+ef4B5NPu2O1YmPqCoQ+uc+tZvJw8s60v1FoFDdGf+zs9F01bWLHV8bpH8zjt6Cqn1Pn/iniU/ENRufyrhIB0mw8NS7j965Lse4B5x/X61y9Xa5NRM99u57V0QNr/CLIOsciP/ANO7a36Gp6J8yg+6Ch/NH3Ql9odH8Q+LHxKOD2DAf1rpaa/0YfQKbGntOWdMNnBVgc+mfMVuT4x2Lm+T3gl2J5JPOeSc0t+EVSHml6ezAgkgdeeKrxGT5ZnlJnQaZpyA4I6AEDzx/OtEWtvpFXzLkb+DmluxyaWe8PFcTX3tvaV4Ku2a5yRVJGdWRbTIksmRXpdDZlItgwcRYrsIvLhKYi2yjIkjaKCq5SNdNOQpYxWSdp1qdMScVgusTOtRThC+4k5qhzxE0+Xll7RM1xb55ZpfCD0jrK2UuQTHDVbl2KZTG9pBgV6HQ1NJZOVq7sJlpjXZSwjyd898sgc82KGZZMXTzUihsGDUskQK21EjrzWhTwWZwMFmVqtjMNxnNADViY1IotqKeSxSN0tRUGWJmhtuKps6EjSKPFcq6XJBm0gGMHkHgjzFZZSwiK6gEzc1x7HmZdFAkoBBBAIPUHkEU4vDyiQLcR1t0tu2WCLQpubUHqqnyyAa9PVJTXJKMmKgFWRhjGHI4HHBxXNtWZsvm8RGNpKivhtx5IO0f3opVan6+THObxwN4ZBkFARjrk56Vv8AR/SimM2pDyJK52os25R0H0Mrla4Flm+ZHIvJqWCDLCpRRWawmu1oJdiUXyVdea9BF8GhFSKeQLRioylgsqjlhSNWSyZ2tPUed65l1rO3RUgSWU1zJXtyOjCtYA92TU52ZRLbgZWY4rm2vkqsGMK5rNJmWTG1la55rXotM7JbmYbrcB8mFFeroqUUed1uozwKru4q2TOLOQonnzUMmaUgNpM1FyIdSy1DcSP/2Q==', 
    caption: 'The day we first laughed together.', 
    story: 'That Tuesday afternoon wasn\'t supposed to be special, but then you told that ridiculous joke about the penguin. I don\'t even remember the punchline anymore, but I remember how your eyes crinkled at the corners. It was the first time I realized that your laughter was my favorite sound in the world.\n\nWe sat on that bench for hours, ignoring the world around us, just caught in the orbit of our own joy. Every time I see this picture, I can still feel the warmth of that sun and the lightness in my chest that hasn\'t gone away since.',
    date: 'Spring 2023' 
  },
  { 
    id: 2, 
    url: '/Users/apple/Downloads/for-rhema/public/1EBC3525-0BC5-4CF0-9DE8-444CA343F166_1_105_c.jpeg', 
    caption: 'Sunset silhouettes and promises.', 
    story: 'We watched the sky turn from gold to violet, and for a moment, everything was quiet. You looked at me and said you felt like the world was too big, but in that moment, the only world I cared about was right here.\n\nYou have this incredible ability to make even the grandest landscapes feel intimate. This sunset was beautiful, but it was just the backdrop to the conversation we had about our dreams and where we wanted to go. I\'m so glad those paths led us here.',
    date: 'Summer 2023' 
  },
  { 
    id: 3, 
    url: 'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?auto=format&fit=crop&q=80&w=800', 
    caption: 'A masterpiece of grace.', 
    story: 'I caught you looking at the rain, completely lost in thought. You didn\'t see me take this, and that\'s why it\'s my favorite. It\'s the "between" moments—the unposed, unscripted versions of you—that truly show your light.\n\nRhema, you don\'t have to try to be beautiful; you just are. Even in the greyest weather, you carry a vibrance that makes the world feel colorful. This photo is a reminder that beauty isn\'t a performance for you, it\'s your natural state.',
    date: 'Autumn 2023' 
  },
  { 
    id: 4, 
    url: 'https://images.unsplash.com/photo-1511632765486-a01980e01a18?auto=format&fit=crop&q=80&w=800', 
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
